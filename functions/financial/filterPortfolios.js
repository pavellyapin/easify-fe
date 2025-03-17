const functions = require("firebase-functions");
const admin = require("firebase-admin");

const firestore = admin.firestore();

exports.filterPortfolios = functions.https.onCall(async (data, context) => {
  const {
    categories = [],
    riskLevels = [],
    isNew = false,
    sortBy = "createdDate",
    count = 10,
    lastPortfolio = null, // To support batch loading (pagination)
  } = data;

  // Ensure the user is authenticated
  if (!context.auth) {
    console.error("User is not authenticated");
    throw new functions.https.HttpsError(
      "failed-precondition",
      "The function must be called while authenticated.",
    );
  }

  try {
    console.log("Starting portfolio filtering with parameters:", {
      categories,
      riskLevels,
      isNew,
      sortBy,
      count,
      lastPortfolio,
    });

    let portfoliosQuery = firestore.collection("portfolios");

    // Apply category filter if provided
    if (categories.length > 0) {
      console.log("Applying category filter:", categories);
      portfoliosQuery = portfoliosQuery.where("category", "in", categories);
    }

    // Apply risk level filter if provided
    if (riskLevels.length > 0) {
      console.log("Applying risk level filter:", riskLevels);
      portfoliosQuery = portfoliosQuery.where("riskLevel", "in", riskLevels);
    }

    // Apply isNew filter if provided
    if (isNew) {
      console.log("Applying isNew filter: true");
      portfoliosQuery = portfoliosQuery.where("isNew", "==", true);
    }

    // Sort portfolios by createdDate (or other provided field)
    if (sortBy) {
      console.log(`Applying sorting by ${sortBy} in descending order`);
      portfoliosQuery = portfoliosQuery.orderBy(sortBy, "desc");
    }

    // If `lastPortfolio` is provided, use `startAfter` for pagination
    if (lastPortfolio) {
      console.log(
        "Applying pagination, starting after lastPortfolio:",
        lastPortfolio,
      );
      const lastPortfolioDoc = await firestore
        .collection("portfolios")
        .doc(lastPortfolio.id)
        .get();
      if (lastPortfolioDoc.exists) {
        console.log("lastPortfolio found in Firestore, applying startAfter");
        portfoliosQuery = portfoliosQuery.startAfter(lastPortfolioDoc);
      } else {
        console.warn(
          "lastPortfolio not found in Firestore, skipping pagination",
        );
      }
    }

    // Fetch the next batch of `count` portfolios
    console.log(`Fetching the next batch of ${count} portfolios`);
    const portfoliosSnapshot = await portfoliosQuery
      .select(
        "createdDate",
        "name",
        "description",
        "category",
        "riskLevel",
        "isNew",
        "portfolioValues",
        "tags",
        "holdings",
      )
      .limit(count)
      .get();

    // Check if any portfolios were retrieved
    if (portfoliosSnapshot.empty) {
      console.log("No portfolios found for the current filters");
      return { portfolios: [], lastPortfolio: null };
    }

    // Transform the portfolios data into an array in the desired format
    const portfolios = portfoliosSnapshot.docs.map((doc) => {
      const data = doc.data();

      // Filter portfolioValues for "01-01" and return every third item
      const filteredPortfolioValues = (data.portfolioValues || []).filter(
        (value) => {
          const dateParts = value.date.split("-");
          return dateParts[2] === "01";
        },
      );

      return {
        id: doc.id,
        createdDate: data.createdDate,
        name: data.name,
        description: data.description,
        category: data.category,
        riskLevel: data.riskLevel,
        isNew: data.isNew,
        portfolioValues: filteredPortfolioValues,
        tags: data.tags,
        holdings: data.holdings,
      };
    });

    console.log("Found and processed portfolios:", portfolios.length);

    // Return the filtered and sorted portfolios, with metadata for the last portfolio
    return {
      portfolios,
      lastPortfolio:
        portfolios.length > 0 ? portfolios[portfolios.length - 1] : null, // Send the last portfolio for the next batch
    };
  } catch (error) {
    console.error("Error filtering portfolios:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Unable to filter portfolios",
    );
  }
});
