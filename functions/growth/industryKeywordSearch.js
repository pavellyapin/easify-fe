/* eslint-disable no-undef */
const functions = require("firebase-functions");
const admin = require("firebase-admin");

const firestore = admin.firestore();

exports.industryKeywordSearch = functions.https.onCall(
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
      const startTime = new Date();
      console.log(
        `[${startTime.toISOString()}] Start: Received request with keyword "${keyword}".`,
      );

      const keywordLower = keyword.toLowerCase();
      const industriesRef = firestore.collection("industries");

      // Fetch only the required fields
      const allIndustriesSnapshot = await industriesRef
        .select(
          "name",
          "detailedInfo.category",
          "detailedInfo.description",
          "detailedInfo.averageSalaryRange",
          "createdDate",
          "isNew",
          "tags",
          "jobs",
        )
        .get();
      const allIndustries = allIndustriesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Initialize arrays to hold related data
      const matchedIndustries = [];
      const relatedCategories = new Set();
      const relatedJobTitles = new Set();
      const relatedTags = new Set();

      // Filter industries by keyword and collect related data
      allIndustries.forEach((industry) => {
        const { name, detailedInfo, tags, jobs } = industry;

        let isMatch = false;

        // Check name
        if (name && name.toLowerCase().includes(keywordLower)) {
          isMatch = true;
        }

        // Check category
        if (
          detailedInfo &&
          detailedInfo?.category &&
          detailedInfo.category.toLowerCase().includes(keywordLower)
        ) {
          isMatch = true;
        }

        // Check description
        if (
          detailedInfo &&
          detailedInfo?.description &&
          detailedInfo.description.toLowerCase().includes(keywordLower)
        ) {
          isMatch = true;
        }

        // Check tags
        if (
          tags &&
          tags.some((tag) => tag.toLowerCase().includes(keywordLower))
        ) {
          isMatch = true;
        }

        // Check jobs array for matching job titles
        if (jobs && Array.isArray(jobs)) {
          jobs.forEach((job) => {
            if (job.name && job.name.toLowerCase().includes(keywordLower)) {
              isMatch = true;
              relatedJobTitles.add(job.name); // Collect related job titles
            }
          });
        }

        if (isMatch) {
          matchedIndustries.push(formatIndustryData(industry));

          // Add only the matching attributes
          if (
            detailedInfo &&
            detailedInfo?.category &&
            detailedInfo?.category.toLowerCase().includes(keywordLower)
          ) {
            relatedCategories.add(detailedInfo?.category.toLowerCase());
          }
          if (tags) {
            tags.forEach((tag) => {
              if (tag.toLowerCase().includes(keywordLower)) {
                relatedTags.add(tag);
              }
            });
          }
        }
      });

      const endTime = new Date();
      console.log(
        `[${endTime.toISOString()}] Found ${matchedIndustries.length} industries matching keyword "${keyword}". Total time: ${
          (endTime - startTime) / 1000
        } seconds.`,
      );

      return {
        industries: matchedIndustries,
        relatedCategories: Array.from(relatedCategories),
        relatedTags: Array.from(relatedTags),
        relatedJobTitles: Array.from(relatedJobTitles),
        keyword: keywordLower,
      };
    } catch (error) {
      console.error(
        `[${new Date().toISOString()}] Error searching industries:`,
        error,
      );
      throw new functions.https.HttpsError(
        "internal",
        "Unable to search for industries.",
      );
    }
  },
);

// Helper function to format industry data consistently
function formatIndustryData(data) {
  // Helper function to get a random sample of 3 jobs
  const getRandomJobs = (jobsArray) => {
    if (!Array.isArray(jobsArray) || jobsArray.length === 0) {
      return [];
    }
    const shuffled = [...jobsArray].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  };

  return {
    id: data.id,
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
