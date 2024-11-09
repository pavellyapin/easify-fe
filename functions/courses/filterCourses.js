const functions = require("firebase-functions");
const admin = require("firebase-admin");

const firestore = admin.firestore();

exports.filterCourses = functions.https.onCall(async (data, context) => {
  const {
    categories = [],
    levels = [],
    isNew = false,
    sortBy = "createdDate",
    count = 10,
    lastCourse = null, // To support batch loading (pagination)
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
    console.log("Starting course filtering with parameters:", {
      categories,
      levels,
      isNew,
      sortBy,
      count,
      lastCourse,
    });

    let coursesQuery = firestore.collection("courses");

    // Apply category filter if provided
    if (categories.length > 0) {
      console.log("Applying category filter:", categories);
      coursesQuery = coursesQuery.where("category", "in", categories);
    }

    // Apply level filter if provided
    if (levels.length > 0) {
      console.log("Applying level filter:", levels);
      coursesQuery = coursesQuery.where("level", "in", levels);
    }

    // Apply isNew filter if provided
    if (isNew) {
      console.log("Applying isNew filter: true");
      coursesQuery = coursesQuery.where("isNew", "==", true);
    }

    // Sort courses by createdDate (or other provided field)
    if (sortBy) {
      console.log(`Applying sorting by ${sortBy} in descending order`);
      coursesQuery = coursesQuery.orderBy(sortBy, "desc");
    }

    // If `lastCourse` is provided, use `startAfter` for pagination
    if (lastCourse) {
      console.log(
        "Applying pagination, starting after lastCourse:",
        lastCourse,
      );
      const lastCourseDoc = await firestore
        .collection("courses")
        .doc(lastCourse.id)
        .get();
      if (lastCourseDoc.exists) {
        console.log("lastCourse found in Firestore, applying startAfter");
        coursesQuery = coursesQuery.startAfter(lastCourseDoc);
      } else {
        console.warn("lastCourse not found in Firestore, skipping pagination");
      }
    }

    // Fetch the next batch of `count` courses
    console.log(`Fetching the next batch of ${count} courses`);
    const coursesSnapshot = await coursesQuery.limit(count).get();

    // Check if any courses were retrieved
    if (coursesSnapshot.empty) {
      console.log("No courses found for the current filters");
      return { courses: [], lastCourse: null };
    }

    // Transform the courses data into an array in the desired format
    const courses = coursesSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        createdDate: data.createdDate,
        name: data.name,
        isNew: data.isNew,
        category: data.category,
        overview: data.overview,
        level: data.level,
        image: data.image,
        tags: data.tags,
      };
    });

    console.log("Found and processed courses:", courses.length);

    // Return the filtered and sorted courses, with metadata for the last course
    return {
      courses,
      lastCourse: courses.length > 0 ? courses[courses.length - 1] : null, // Send the last course for the next batch
    };
  } catch (error) {
    console.error("Error filtering courses:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Unable to filter courses",
    );
  }
});
