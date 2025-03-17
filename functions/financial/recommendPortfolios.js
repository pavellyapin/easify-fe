/* eslint-disable no-undef */
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { getRandomSelection, hasPartialMatch } = require("../utils");

const firestore = admin.firestore();

exports.recommendPortfolios = functions.https.onCall(async (data, context) => {
  const { portfolioTags, count } = data;

  if (!context.auth) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "The function must be called while authenticated.",
    );
  }

  try {
    const startTime = new Date();
    console.log(`[${startTime.toISOString()}] Start: Received request.`);

    const portfoliosRef = firestore.collection("portfolios");
    const userRef = firestore.collection("users").doc(context.auth.uid);

    // Step 1: Determine tags to use for filtering portfolios
    let tagsToUse =
      portfolioTags && portfolioTags.length > 0
        ? portfolioTags
        : await fetchUserPortfolioTags(userRef);

    // Step 2: Fetch exact matches for the tagsToUse
    const exactMatchPortfolios = await fetchExactMatchPortfolios(
      tagsToUse,
      portfoliosRef,
      count,
    );

    if (count && exactMatchPortfolios.length >= count) {
      console.log(
        `[${new Date().toISOString()}] Exact matches satisfy the count.`,
      );
      return exactMatchPortfolios;
    }

    // Step 3: Fetch partial matches if more portfolios are needed
    const additionalNeeded = count ? count - exactMatchPortfolios.length : 0;
    const partialMatchPortfolios =
      additionalNeeded > 0
        ? await fetchPartialMatchPortfolios(
            tagsToUse,
            portfoliosRef,
            additionalNeeded,
          )
        : [];

    // Combine exact and partial matches, ensuring uniqueness
    const recommendedPortfolios = combineUniquePortfolios(
      exactMatchPortfolios,
      partialMatchPortfolios,
      count,
    );

    const endTime = new Date();
    console.log(
      `[${endTime.toISOString()}] Finished processing. Total time: ${
        (endTime - startTime) / 1000
      } seconds.`,
    );
    return recommendedPortfolios;
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] Error recommending portfolios:`,
      error,
    );
    throw new functions.https.HttpsError(
      "internal",
      "Unable to recommend portfolios",
    );
  }
});

// Helper functions
async function fetchUserPortfolioTags(userRef) {
  const userDoc = await userRef.get();
  const userData = userDoc.data();
  const userPortfolioPreferences = [
    ...(userData.financialPlanning?.planCategories || []),
    ...(userData.financialPlanning?.planTags || []),
  ];
  console.log(
    `[${new Date().toISOString()}] Using tags from user preferences:`,
    userPortfolioPreferences,
  );
  return userPortfolioPreferences.length > 0
    ? userPortfolioPreferences
    : ["balanced"];
}

async function fetchExactMatchPortfolios(tags, portfoliosRef, count) {
  const exactMatchSnapshot = await portfoliosRef
    .where("tags", "array-contains-any", tags)
    .get();
  const exactMatchPortfolios = exactMatchSnapshot.docs.map((doc) =>
    formatPortfolioData(doc),
  );
  console.log(
    `[${new Date().toISOString()}] Fetched exact matches: ${exactMatchPortfolios.length}`,
  );
  return getRandomSelection(exactMatchPortfolios, count);
}

async function fetchPartialMatchPortfolios(tags, portfoliosRef, count) {
  const allPortfoliosSnapshot = await portfoliosRef.get();
  const allPortfolios = allPortfoliosSnapshot.docs.map((doc) =>
    formatPortfolioData(doc),
  );

  const partialMatches = allPortfolios.filter((portfolio) => {
    const portfolioTagsArray = Array.isArray(portfolio.tags)
      ? portfolio.tags
      : [portfolio.tags];
    return tags.some((tag) =>
      portfolioTagsArray.some((portfolioTag) =>
        hasPartialMatch(tag, portfolioTag),
      ),
    );
  });

  console.log(
    `[${new Date().toISOString()}] Found partial matches: ${partialMatches.length}`,
  );
  return getRandomSelection(partialMatches, count);
}

function combineUniquePortfolios(exactMatches, partialMatches, count) {
  const uniquePortfolios = new Map();
  [...exactMatches, ...partialMatches].forEach((portfolio) =>
    uniquePortfolios.set(portfolio.id, portfolio),
  );

  const recommendedPortfolios = Array.from(uniquePortfolios.values());
  return count
    ? getRandomSelection(recommendedPortfolios, count)
    : recommendedPortfolios;
}

// Helper function to format portfolio data consistently
function formatPortfolioData(doc) {
  const data = doc.data();

  // Filter portfolioValues for "01-01" and return every third item
  const filteredPortfolioValues = (data.portfolioValues || [])
    .filter((value) => {
      const dateParts = value.date.split("-");
      return dateParts[2] === "01";
    })
    .filter((_, index) => index % 2 === 0); // Return every third item

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
}
