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
    const userRef = firestore.collection("users").doc(context.auth.uid);

    let tagsToUse = workoutTags;

    // If no workoutTags are provided, fetch user's started workouts and/or preferences
    if (!workoutTags || workoutTags.length === 0) {
      console.log("No workoutTags provided. Fetching started workouts.");

      // Fetch the user's started workouts under users/{userId}/workouts
      const startedWorkoutsSnapshot = await firestore
        .collection(`users/${context.auth.uid}/workouts`)
        .get();

      const startedWorkouts = startedWorkoutsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          tags: data.tags || [],
        };
      });

      // Extract tags from started workouts if they exist
      const startedWorkoutTags = startedWorkouts.reduce((acc, workout) => {
        return acc.concat(workout.tags);
      }, []);

      if (startedWorkoutTags.length > 0) {
        console.log("Using tags from started workouts:", startedWorkoutTags);
        tagsToUse = startedWorkoutTags;
      } else {
        // If no started workouts or tags, fetch user workout preferences
        console.log(
          "No tags from started workouts, fetching user preferences.",
        );

        const userDoc = await userRef.get();
        const userData = userDoc.data();

        const userLifestyleHealth = userData.lifestyleHealth || {};
        tagsToUse = [
          ...(userLifestyleHealth.workoutCategories || []),
          ...(userLifestyleHealth.workoutTags || []),
        ];

        console.log("Using tags from user's workout preferences:", tagsToUse);
      }
    }

    if (tagsToUse.length === 0) {
      console.log("No tags available, returning all workouts.");

      // Fetch all workouts
      const allWorkoutsSnapshot = await workoutsRef.get();
      const allWorkouts = allWorkoutsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          createdDate: data.createdDate,
          name: data.name,
          category: data.category,
          overview: data.description,
          level: data.difficulty,
          tags: data.tags,
        };
      });

      // If count is specified, return a random selection of the workouts
      if (count) {
        return getRandomSelection(allWorkouts, count);
      }

      return allWorkouts;
    }

    console.log("Tags to use for fetching workouts:", tagsToUse);

    // Fetch workouts that match any of the tagsToUse
    const workoutsQuerySnapshot = await workoutsRef
      .where("tags", "array-contains-any", tagsToUse)
      .get();

    const workouts = workoutsQuerySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        createdDate: data.createdDate,
        name: data.name,
        category: data.category,
        overview: data.description,
        level: data.difficulty,
        tags: data.tags,
      };
    });

    console.log("Found workouts matching tags:", workouts.length);

    // Fetch all workouts for broader filtering
    const allWorkoutsSnapshot = await workoutsRef.get();
    const allWorkouts = allWorkoutsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        createdDate: data.createdDate,
        name: data.name,
        category: data.category,
        overview: data.description,
        level: data.difficulty,
        tags: data.tags,
      };
    });

    // Filter additional workouts based on partial tag matches
    const additionalWorkouts = allWorkouts.filter((workout) => {
      const workoutTagsArray = Array.isArray(workout.tags)
        ? workout.tags
        : [workout.tags]; // Ensure tags is an array

      return tagsToUse.some((tag) =>
        workoutTagsArray.some((workoutTag) => {
          // Check if the workout is not already in the list and has a partial tag match
          return (
            !workouts.find((w) => w.id === workout.id) &&
            hasPartialMatch(tag, workoutTag)
          );
        }),
      );
    });

    console.log(
      "Found additional workouts based on partial matches:",
      additionalWorkouts.length,
    );

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

    console.log("Final recommended workouts:", recommendedWorkouts.length);

    return recommendedWorkouts;
  } catch (error) {
    console.error("Error recommending workouts:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Unable to recommend workouts",
    );
  }
});
