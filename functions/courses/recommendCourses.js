/* eslint-disable no-undef */
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { getRandomSelection, hasPartialMatch } = require("../utils");

const firestore = admin.firestore();

exports.recommendCourses = functions.https.onCall(async (data, context) => {
  const { courseTags, count } = data;

  if (!context.auth) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "The function must be called while authenticated.",
    );
  }

  try {
    const startTime = new Date();
    console.log(`[${startTime.toISOString()}] Start: Received request.`);

    const coursesRef = firestore.collection("courses");
    const userRef = firestore.collection("users").doc(context.auth.uid);

    // Fetch the user's started courses
    const startedCoursesSnapshot = await firestore
      .collection(`users/${context.auth.uid}/courses`)
      .get();
    console.log(`[${new Date().toISOString()}] Fetched started courses.`);

    const startedCourses = startedCoursesSnapshot.docs.map((doc) => doc.id);

    // Determine tags to use based on user preferences if courseTags are not provided
    let tagsToUse = courseTags;
    if (!courseTags || courseTags.length === 0) {
      console.log(
        `[${new Date().toISOString()}] No courseTags provided. Fetching user preferences.`,
      );

      const userDoc = await userRef.get();
      const userData = userDoc.data();
      console.log(`[${new Date().toISOString()}] Fetched user data.`);

      const userWorkSkills = userData.workSkills || {};
      tagsToUse = [...(userWorkSkills.courseTags || [])];
      // Use 'beginner' as a default tag if no tags are found in user preferences
      if (tagsToUse.length === 0) {
        tagsToUse = ["beginner"];
        console.log(
          `[${new Date().toISOString()}] No user preference tags found. Defaulting to 'beginner'.`,
        );
      } else {
        console.log(
          `[${new Date().toISOString()}] Using tags from user's course preferences:`,
          tagsToUse,
        );
      }
    }

    // Step 1: Query for exact matches using array-contains-any
    const exactMatchQuerySnapshot = await coursesRef
      .where("tags", "array-contains-any", tagsToUse)
      .get();
    console.log(`[${new Date().toISOString()}] Fetched exact match courses.`);

    const exactMatchCourses = exactMatchQuerySnapshot.docs
      .map((doc) => ({
        id: doc.id,
        createdDate: doc.data().createdDate,
        name: doc.data().name,
        isNew: doc.data().isNew,
        category: doc.data().category,
        overview: doc.data().overview,
        level: doc.data().level,
        image: doc.data().image,
        tags: doc.data().tags,
      }))
      .filter((course) => !startedCourses.includes(course.id));

    console.log(
      `[${new Date().toISOString()}] Filtered out started courses from exact matches: ${exactMatchCourses.length}`,
    );

    // Step 2: Check if we have enough exact matches
    if (count && exactMatchCourses.length >= count) {
      const selectedCourses = getRandomSelection(exactMatchCourses, count);
      console.log(
        `[${new Date().toISOString()}] Satisfied course count with exact matches. Returning ${selectedCourses.length} courses.`,
      );
      return selectedCourses;
    }

    // Step 3: Calculate additional courses needed and fetch partial matches if needed
    const additionalNeeded = count ? count - exactMatchCourses.length : 0;
    let partialMatchCourses = [];
    if (additionalNeeded > 0) {
      const allCoursesSnapshot = await coursesRef.get();
      console.log(
        `[${new Date().toISOString()}] Fetched all courses for partial matches.`,
      );

      partialMatchCourses = allCoursesSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          createdDate: doc.data().createdDate,
          name: doc.data().name,
          isNew: doc.data().isNew,
          category: doc.data().category,
          overview: doc.data().overview,
          level: doc.data().level,
          image: doc.data().image,
          tags: doc.data().tags,
        }))
        .filter((course) => {
          const courseTagsArray = Array.isArray(course.tags)
            ? course.tags
            : [course.tags];
          return (
            !startedCourses.includes(course.id) &&
            tagsToUse.some((tag) =>
              courseTagsArray.some((courseTag) =>
                hasPartialMatch(tag, courseTag),
              ),
            )
          );
        })
        .slice(0, additionalNeeded);

      console.log(
        `[${new Date().toISOString()}] Found partial match courses: ${partialMatchCourses.length}`,
      );
    }

    // Combine exact and partial matches, prioritizing uniqueness
    const uniqueCourses = new Map();
    [...exactMatchCourses, ...partialMatchCourses].forEach((course) => {
      uniqueCourses.set(course.id, course);
    });

    let recommendedCourses = Array.from(uniqueCourses.values());

    // Step 4: Limit the result to the requested count
    if (count) {
      recommendedCourses = getRandomSelection(recommendedCourses, count);
      console.log(
        `[${new Date().toISOString()}] Selected random subset of recommended courses: ${recommendedCourses.length}`,
      );
    }

    const endTime = new Date();
    console.log(
      `[${endTime.toISOString()}] Finished processing recommendation. Total time: ${(endTime - startTime) / 1000} seconds.`,
    );

    return recommendedCourses;
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] Error recommending courses:`,
      error,
    );
    throw new functions.https.HttpsError(
      "internal",
      "Unable to recommend courses",
    );
  }
});
