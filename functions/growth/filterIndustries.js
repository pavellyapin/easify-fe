const functions = require("firebase-functions");
const admin = require("firebase-admin");

const firestore = admin.firestore();

exports.filterIndustries = functions.https.onCall(async (data, context) => {
  const {
    categories = [],
    tags = [],
    isNew = false,
    sortBy = "createdDate",
    count = 10,
    lastIndustry = null, // To support batch loading (pagination)
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
    console.log("Starting industries filtering with parameters:", {
      categories,
      tags,
      isNew,
      sortBy,
      count,
      lastIndustry,
    });

    let industriesQuery = firestore.collection("industries");

    // Apply category filter if provided
    if (categories.length > 0) {
      console.log("Applying category filter:", categories);
      industriesQuery = industriesQuery.where(
        "detailedInfo.category",
        "in",
        categories,
      );
    }

    // Apply tags filter if provided
    if (tags.length > 0) {
      console.log("Applying tags filter:", tags);
      industriesQuery = industriesQuery.where(
        "tags",
        "array-contains-any",
        tags,
      );
    }

    // Apply isNew filter if provided
    if (isNew) {
      console.log("Applying isNew filter: true");
      industriesQuery = industriesQuery.where("isNew", "==", true);
    }

    // Sort industries by createdDate (or other provided field)
    if (sortBy) {
      console.log(`Applying sorting by ${sortBy} in descending order`);
      industriesQuery = industriesQuery.orderBy(sortBy, "desc");
    }

    // If `lastIndustry` is provided, use `startAfter` for pagination
    if (lastIndustry) {
      console.log(
        "Applying pagination, starting after lastIndustry:",
        lastIndustry,
      );
      const lastIndustryDoc = await firestore
        .collection("industries")
        .doc(lastIndustry.id)
        .get();
      if (lastIndustryDoc.exists) {
        console.log("lastIndustryDoc found in Firestore, applying startAfter");
        industriesQuery = industriesQuery.startAfter(lastIndustryDoc);
      } else {
        console.warn("industries not found in Firestore, skipping pagination");
      }
    }

    // Fetch the next batch of `count` industries
    console.log(`Fetching the next batch of ${count} industries`);
    const industriesSnapshot = await industriesQuery
      .select(
        "createdDate",
        "name",
        "isNew",
        "detailedInfo.category",
        "detailedInfo.description",
        "detailedInfo.averageSalaryRange",
        "tags",
        "jobs",
      )
      .limit(count)
      .get();

    // Check if any industries were retrieved
    if (industriesSnapshot.empty) {
      console.log("No industries found for the current filters");
      return { industries: [], lastIndustry: null };
    }

    // Helper function to get a random sample of 3 jobs
    const getRandomJobs = (jobsArray) => {
      if (!Array.isArray(jobsArray) || jobsArray.length === 0) {
        return [];
      }
      const shuffled = [...jobsArray].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 3);
    };

    // Transform the industries data into an array in the desired format
    const industries = industriesSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        createdDate: data.createdDate,
        name: data.name,
        isNew: data.isNew,
        category: data.detailedInfo.category,
        description: data.detailedInfo.description,
        jobsCount: data.jobs.length,
        jobsSample: getRandomJobs(data.jobs),
        averageSalaryRange: data.detailedInfo.averageSalaryRange,
        tags: data.tags,
      };
    });

    console.log("Found and processed industries:", industries.length);

    // Return the filtered and sorted industries, with metadata for the last industries
    return {
      industries,
      lastIndustry:
        industries.length > 0 ? industries[industries.length - 1] : null, // Send the last industries for the next batch
    };
  } catch (error) {
    console.error("Error filtering industries:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Unable to filter industries",
    );
  }
});
