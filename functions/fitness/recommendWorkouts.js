/* eslint-disable no-undef */
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { getRandomSelection, hasPartialMatch } = require("../utils");

const firestore = admin.firestore();

exports.recommendWorkouts = functions.https.onCall(async (data, context) => {
  const { workoutTags, count } = data;

  if (!context.auth) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "The function must be called while authenticated.",
    );
  }

  try {
    const workoutsRef = firestore.collection("workouts");

    // Fetch workouts that match any of the workoutTags
    const workoutsQuerySnapshot = await workoutsRef
      .where("tags", "array-contains-any", workoutTags)
      .get();

    const workouts = workoutsQuerySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        createdDate: data.createdDate,
        name: data.name,
        overview: data.description,
        level: data.difficulty,
        tags: data.tags,
      };
    });

    // Fetch all workouts for broader filtering
    const allWorkoutsSnapshot = await workoutsRef.get();
    const allWorkouts = allWorkoutsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        createdDate: data.createdDate,
        name: data.name,
        overview: data.description,
        level: data.difficulty,
        tags: data.tags,
      };
    });

    // Filter additional workouts based on partial tag matches
    const additionalWorkouts = allWorkouts.filter((workout) => {
      return workoutTags.some((tag) =>
        workout.tags.some(
          (workoutTag) =>
            !workouts.find((w) => w.id === workout.id) &&
            hasPartialMatch(tag, workoutTag),
        ),
      );
    });

    // Combine and deduplicate the workout recommendations
    const uniqueWorkouts = new Map();
    [...workouts, ...additionalWorkouts].forEach((workout) => {
      uniqueWorkouts.set(workout.id, workout);
    });

    let recommendedWorkouts = Array.from(uniqueWorkouts.values());

    // If count is specified, return a random selection of the workouts
    if (count) {
      recommendedWorkouts = getRandomSelection(recommendedWorkouts, count);
    }

    return recommendedWorkouts;
  } catch (error) {
    console.error("Error recommending workouts:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Unable to recommend workouts",
    );
  }
});
