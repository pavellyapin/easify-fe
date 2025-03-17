const functions = require("firebase-functions");
const admin = require("firebase-admin");

const firestore = admin.firestore();

exports.courseKeywordSearch = functions.https.onCall(async (data, context) => {
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
    const coursesRef = firestore.collection("courses");

    console.log(`[${new Date().toISOString()}] Fetching all courses...`);

    // Fetch all courses
    const fetchStart = new Date();
    const allCoursesSnapshot = await coursesRef
      .select(
        "name",
        "tags",
        "category",
        "overview",
        "image",
        "isNew",
        "level",
        "createdDate",
      )
      .get();
    const fetchEnd = new Date();
    console.log(
      `[${fetchEnd.toISOString()}] Fetched all courses. Total time for fetch: ${(fetchEnd - fetchStart) / 1000} seconds.`,
    );

    const parseStart = new Date();
    const allCourses = allCoursesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    const parseEnd = new Date();
    console.log(
      `[${parseEnd.toISOString()}] Parsed all courses. Total time for parsing: ${(parseEnd - parseStart) / 1000} seconds.`,
    );

    console.log(
      `[${new Date().toISOString()}] Filtering courses for matches...`,
    );

    // Initialize arrays to hold related data
    const matchedCourses = [];
    // eslint-disable-next-line no-undef
    const relatedCategories = new Set();
    // eslint-disable-next-line no-undef
    const relatedTags = new Set();

    const filterStart = new Date();
    // Filter courses by keyword and collect related data
    allCourses.forEach((course) => {
      const { name, category, tags, overview } = course;

      let isMatch = false;

      // Check name
      if (name && name.toLowerCase().includes(keywordLower)) {
        isMatch = true;
      }

      // Check category
      if (category && category.toLowerCase().includes(keywordLower)) {
        isMatch = true;
      }

      // Check description
      if (overview && overview.toLowerCase().includes(keywordLower)) {
        isMatch = true;
      }

      // Check tags
      if (
        tags &&
        tags.some((tag) => tag.toLowerCase().includes(keywordLower))
      ) {
        isMatch = true;
      }

      if (isMatch) {
        matchedCourses.push(formatCourseData(course));

        // Add only the matching attributes
        if (category && category.toLowerCase().includes(keywordLower)) {
          relatedCategories.add(category.toLowerCase());
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
    const filterEnd = new Date();
    console.log(
      `[${filterEnd.toISOString()}] Finished filtering courses. Total time for filtering: ${(filterEnd - filterStart) / 1000} seconds.`,
    );

    const endTime = new Date();
    console.log(
      `[${endTime.toISOString()}] Found ${matchedCourses.length} courses matching keyword "${keyword}". Total time for function: ${(endTime - startTime) / 1000} seconds.`,
    );

    return {
      courses: matchedCourses,
      relatedCategories: Array.from(relatedCategories),
      relatedTags: Array.from(relatedTags),
      keyword: keywordLower,
    };
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] Error searching courses:`,
      error,
    );
    throw new functions.https.HttpsError(
      "internal",
      "Unable to search for courses.",
    );
  }
});

// Helper function to format course data consistently
function formatCourseData(data) {
  return {
    id: data.id,
    createdDate: data.createdDate,
    name: data.name,
    isNew: data.isNew,
    category: data.category,
    overview: data.overview,
    level: data.level,
    image: data.image,
    tags: data.tags,
  };
}
