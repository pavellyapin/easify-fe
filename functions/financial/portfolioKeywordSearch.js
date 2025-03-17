const functions = require("firebase-functions");
const admin = require("firebase-admin");

const firestore = admin.firestore();

exports.portfolioKeywordSearch = functions.https.onCall(
  async (data, context) => {
    const { keyword } = data;

    if (!context.auth) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called while authenticated.",
      );
    }

    if (!keyword || typeof keyword !== "string") {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "A valid keyword must be provided.",
      );
    }

    try {
      const keywordLower = keyword.toLowerCase();
      const portfoliosRef = firestore.collection("portfolios");

      console.log(`[${new Date().toISOString()}] Fetching all portfolios...`);

      const allPortfoliosSnapshot = await portfoliosRef
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
        .get();

      const allPortfolios = allPortfoliosSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log(
        `[${new Date().toISOString()}] Filtering portfolios for keyword matches...`,
      );

      // Initialize arrays for matching results
      const matchedPortfolios = [];
      // eslint-disable-next-line no-undef
      const relatedTickers = new Set();

      // Filter portfolios by keyword
      allPortfolios.forEach((portfolio) => {
        const { name, description, riskLevel, holdings } = portfolio;

        let isMatch = false;

        // Check portfolio name
        if (name && name.toLowerCase().includes(keywordLower)) {
          isMatch = true;
        }

        // Check portfolio description
        if (description && description.toLowerCase().includes(keywordLower)) {
          isMatch = true;
        }

        // Check risk level
        if (riskLevel && riskLevel.toLowerCase().includes(keywordLower)) {
          isMatch = true;
        }

        // Check holdings (tickers)
        if (
          holdings &&
          holdings.some((holding) =>
            holding.ticker.toLowerCase().includes(keywordLower),
          )
        ) {
          isMatch = true;
        }

        if (isMatch) {
          matchedPortfolios.push(formatPortfolioData(portfolio));

          // Add related tickers
          if (holdings) {
            holdings.forEach((holding) => {
              if (holding.ticker.toLowerCase().includes(keywordLower)) {
                relatedTickers.add(holding.ticker.toUpperCase());
              }
            });
          }
        }
      });

      return {
        portfolios: matchedPortfolios,
        relatedTickers: Array.from(relatedTickers),
        keyword: keywordLower,
      };
    } catch (error) {
      console.error(
        `[${new Date().toISOString()}] Error searching portfolios:`,
        error,
      );
      throw new functions.https.HttpsError(
        "internal",
        "Unable to search for portfolios.",
      );
    }
  },
);

// Helper function to format portfolio data consistently
function formatPortfolioData(data) {
  // Filter portfolioValues for "01-01" and return every third item
  const filteredPortfolioValues = (data.portfolioValues || [])
    .filter((value) => {
      const dateParts = value.date.split("-");
      return dateParts[2] === "01";
    })
    .filter((_, index) => index % 2 === 0); // Return every third item

  return {
    id: data.id,
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
}
