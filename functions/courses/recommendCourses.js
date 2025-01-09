/* eslint-disable no-undef */
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { getRandomSelection } = require("../utils");

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

    // Step 1: Use provided courseTags if available
    let recommendedCourses = [];
    if (courseTags && courseTags.length > 0) {
      console.log(`[${new Date().toISOString()}] Using provided courseTags.`);
      const exactMatchQuerySnapshot = await coursesRef
        .where("tags", "array-contains-any", courseTags)
        .get();

      recommendedCourses = exactMatchQuerySnapshot.docs
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
        `[${new Date().toISOString()}] Found ${recommendedCourses.length} courses with provided courseTags.`,
      );
    }

    // Step 2: If not enough matches, try user profile tags
    if (recommendedCourses.length < count) {
      const additionalNeeded = count - recommendedCourses.length;
      console.log(
        `[${new Date().toISOString()}] Fetching user profile tags for more matches.`,
      );

      const userDoc = await userRef.get();
      const userData = userDoc.data();
      console.log(`[${new Date().toISOString()}] Fetched user data.`);

      const planCategories = userData?.financialPlanning?.planCategories || [];
      const planTags = userData?.financialPlanning?.planTags || [];
      const courseTagsFromUser = userData?.workSkills?.courseTags || [];
      const industries = userData?.workSkills?.industries || [];
      const userProfileTags = [
        ...planCategories,
        ...planTags,
        ...courseTagsFromUser,
        ...industries,
      ];

      console.log(
        `[${new Date().toISOString()}] Combined user tags:`,
        userProfileTags,
      );
      if (userProfileTags && userProfileTags.length > 0) {
        const userProfileQuerySnapshot = await coursesRef
          .where("tags", "array-contains-any", userProfileTags)
          .get();

        const userProfileMatches = userProfileQuerySnapshot.docs
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
          .filter(
            (course) =>
              !startedCourses.includes(course.id) &&
              !recommendedCourses.some((c) => c.id === course.id),
          );

        console.log(
          `[${new Date().toISOString()}] Found ${userProfileMatches.length} additional courses from user profile tags.`,
        );
        recommendedCourses.push(
          ...userProfileMatches.slice(0, additionalNeeded),
        );
      }
    }

    // Step 3: If still not enough matches, fetch newest courses
    if (recommendedCourses.length < count) {
      const additionalNeeded = count - recommendedCourses.length;
      console.log(
        `[${new Date().toISOString()}] Fetching ${additionalNeeded} newest courses.`,
      );

      const newestCoursesSnapshot = await coursesRef
        .orderBy("createdDate", "desc")
        .limit(30)
        .get();

      const newestCourses = newestCoursesSnapshot.docs
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
        .filter(
          (course) =>
            !startedCourses.includes(course.id) &&
            !recommendedCourses.some((c) => c.id === course.id),
        );

      console.log(
        `[${new Date().toISOString()}] Fetched ${newestCourses.length} newest courses.`,
      );

      recommendedCourses.push(...newestCourses);
    }

    // Step 4: Limit the result to the requested count
    const finalRecommendations = getRandomSelection(recommendedCourses, count);

    const endTime = new Date();
    console.log(
      `[${endTime.toISOString()}] Finished processing recommendation. Total time: ${(endTime - startTime) / 1000} seconds.`,
    );

    return finalRecommendations;
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
