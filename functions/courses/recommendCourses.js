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
    const coursesRef = firestore.collection("courses");

    const coursesQuerySnapshot = await coursesRef
      .where("tags", "array-contains-any", courseTags)
      .get();

    const courses = coursesQuerySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        createdDate: data.createdDate,
        name: data.name,
        overview: data.overview,
        level: data.level,
        tags: data.tags,
      };
    });

    const allCoursesSnapshot = await coursesRef.get();
    const allCourses = allCoursesSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        createdDate: data.createdDate,
        name: data.name,
        overview: data.overview,
        level: data.level,
        tags: data.tags,
      };
    });

    const additionalCourses = allCourses.filter((course) => {
      return courseTags.some((tag) =>
        course.tags.some(
          (courseTag) =>
            !courses.find((c) => c.id === course.id) &&
            hasPartialMatch(tag, courseTag),
        ),
      );
    });

    const uniqueCourses = new Map();
    [...courses, ...additionalCourses].forEach((course) => {
      uniqueCourses.set(course.id, course);
    });

    let recommendedCourses = Array.from(uniqueCourses.values());

    if (count) {
      recommendedCourses = getRandomSelection(recommendedCourses, count);
    }

    return recommendedCourses;
  } catch (error) {
    console.error("Error recommending courses:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Unable to recommend courses",
    );
  }
});
