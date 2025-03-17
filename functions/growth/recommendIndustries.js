const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { getRandomSelection, hasPartialMatch } = require("../utils");

const firestore = admin.firestore();

exports.recommendIndustries = functions.https.onCall(async (data, context) => {
  const { industryTags, count } = data;

  if (!context.auth) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "The function must be called while authenticated.",
    );
  }

  try {
    const startTime = new Date();
    console.log(`[${startTime.toISOString()}] Start: Received request.`);

    const industriesRef = firestore.collection("industries");
    const userRef = firestore.collection("users").doc(context.auth.uid);

    // Step 1: Determine tags to use for filtering industries
    let tagsToUse =
      industryTags && industryTags.length > 0
        ? industryTags
        : await fetchUserIndustryTags(userRef);

    // Step 2: Fetch exact matches for the tagsToUse
    const exactMatchIndustries = await fetchExactMatchIndustries(
      tagsToUse,
      industriesRef,
      count,
    );

    if (count && exactMatchIndustries.length >= count) {
      return exactMatchIndustries;
    }

    // Step 3: Fetch partial matches if more industries are needed
    const additionalNeeded = count ? count - exactMatchIndustries.length : 0;
    const partialMatchIndustries =
      additionalNeeded > 0
        ? await fetchPartialMatchIndustries(
            tagsToUse,
            industriesRef,
            additionalNeeded,
          )
        : [];

    // Combine exact and partial matches, ensuring uniqueness
    const recommendedIndustries = combineUniqueIndustries(
      exactMatchIndustries,
      partialMatchIndustries,
      count,
    );
    return recommendedIndustries;
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] Error recommending industries:`,
      error,
    );
    throw new functions.https.HttpsError(
      "internal",
      "Unable to recommend industries",
    );
  }
});

// Helper functions
async function fetchUserIndustryTags(userRef) {
  const userDoc = await userRef.get();
  const userData = userDoc.data();
  const userIndustryPreferences = [...(userData.workSkills?.industries || [])];
  console.log(
    `[${new Date().toISOString()}] Using tags from user preferences:`,
    userIndustryPreferences,
  );
  return userIndustryPreferences.length > 0
    ? userIndustryPreferences
    : ["emerging"];
}

async function fetchExactMatchIndustries(tags, industriesRef, count) {
  const exactMatchSnapshot = await industriesRef
    .where("tags", "array-contains-any", tags)
    .get();
  const exactMatchIndustries = exactMatchSnapshot.docs.map((doc) =>
    formatIndustryData(doc),
  );
  console.log(
    `[${new Date().toISOString()}] Fetched exact matches: ${exactMatchIndustries.length}`,
  );
  return getRandomSelection(exactMatchIndustries, count);
}

async function fetchPartialMatchIndustries(tags, industriesRef, count) {
  const allIndustriesSnapshot = await industriesRef.get();
  const allIndustries = allIndustriesSnapshot.docs.map((doc) =>
    formatIndustryData(doc),
  );

  const partialMatches = allIndustries.filter((industry) => {
    const industryTagsArray = Array.isArray(industry.tags)
      ? industry.tags
      : [industry.tags];
    return tags.some((tag) =>
      industryTagsArray.some((industryTag) =>
        hasPartialMatch(tag, industryTag),
      ),
    );
  });

  console.log(
    `[${new Date().toISOString()}] Found partial matches: ${partialMatches.length}`,
  );
  return getRandomSelection(partialMatches, count);
}

function combineUniqueIndustries(exactMatches, partialMatches, count) {
  // eslint-disable-next-line no-undef
  const uniqueIndustries = new Map();
  [...exactMatches, ...partialMatches].forEach((industry) =>
    uniqueIndustries.set(industry.id, industry),
  );

  const recommendedIndustries = Array.from(uniqueIndustries.values());
  return count
    ? getRandomSelection(recommendedIndustries, count)
    : recommendedIndustries;
}

// Helper function to format industry data consistently
function formatIndustryData(doc) {
  const data = doc.data();

  // Helper function to get a random sample of 3 jobs
  const getRandomJobs = (jobsArray) => {
    if (!Array.isArray(jobsArray) || jobsArray.length === 0) {
      return [];
    }
    const shuffled = [...jobsArray].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  };
  return {
    id: doc.id,
    createdDate: data.createdDate,
    name: data.name,
    isNew: data.isNew,
    category: data.detailedInfo?.category,
    description: data.detailedInfo?.description,
    jobsCount: data.jobs.length,
    jobsSample: getRandomJobs(data.jobs),
    averageSalaryRange: data.detailedInfo?.averageSalaryRange,
    tags: data.tags,
  };
}
