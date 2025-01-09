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
    const startTime = new Date();
    console.log(`[${startTime.toISOString()}] Start: Received request.`);

    const workoutsRef = firestore.collection("workouts");
    const userRef = firestore.collection("users").doc(context.auth.uid);

    // Step 1: Determine tags to use for filtering workouts
    let tagsToUse =
      workoutTags && workoutTags.length > 0
        ? workoutTags
        : await fetchUserWorkoutTags(userRef);

    // Step 2: Fetch exact matches for the tagsToUse
    const exactMatchWorkouts = await fetchExactMatchWorkouts(
      tagsToUse,
      workoutsRef,
      count,
    );

    if (count && exactMatchWorkouts.length >= count) {
      console.log(
        `[${new Date().toISOString()}] Exact matches satisfy the count.`,
      );
      return exactMatchWorkouts;
    }

    // Step 3: Fetch partial matches if more workouts are needed
    const additionalNeeded = count ? count - exactMatchWorkouts.length : 0;
    const partialMatchWorkouts =
      additionalNeeded > 0
        ? await fetchPartialMatchWorkouts(
            tagsToUse,
            workoutsRef,
            additionalNeeded,
          )
        : [];

    // Combine exact and partial matches, ensuring uniqueness
    const recommendedWorkouts = combineUniqueWorkouts(
      exactMatchWorkouts,
      partialMatchWorkouts,
      count,
    );

    const endTime = new Date();
    console.log(
      `[${endTime.toISOString()}] Finished processing. Total time: ${(endTime - startTime) / 1000} seconds.`,
    );
    return recommendedWorkouts;
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] Error recommending workouts:`,
      error,
    );
    throw new functions.https.HttpsError(
      "internal",
      "Unable to recommend workouts",
    );
  }
});

// Helper functions
async function fetchUserWorkoutTags(userRef) {
  // Fall back to user preferences if no started workouts found
  const userDoc = await userRef.get();
  const userData = userDoc.data();
  const userWorkoutPreferences = [
    ...(userData.lifestyleHealth?.workoutCategories || []),
    ...(userData.lifestyleHealth?.workoutTags || []),
  ];
  console.log(
    `[${new Date().toISOString()}] Using tags from user preferences:`,
    userWorkoutPreferences,
  );
  return userWorkoutPreferences.length > 0
    ? userWorkoutPreferences
    : ["beginner"];
}

async function fetchExactMatchWorkouts(tags, workoutsRef, count) {
  const exactMatchSnapshot = await workoutsRef
    .where("tags", "array-contains-any", tags)
    .get();
  const exactMatchWorkouts = exactMatchSnapshot.docs.map((doc) =>
    formatWorkoutData(doc),
  );
  console.log(
    `[${new Date().toISOString()}] Fetched exact matches: ${exactMatchWorkouts.length}`,
  );
  return getRandomSelection(exactMatchWorkouts, count);
}

async function fetchPartialMatchWorkouts(tags, workoutsRef, count) {
  const allWorkoutsSnapshot = await workoutsRef.get();
  const allWorkouts = allWorkoutsSnapshot.docs.map((doc) =>
    formatWorkoutData(doc),
  );

  const partialMatches = allWorkouts.filter((workout) => {
    const workoutTagsArray = Array.isArray(workout.tags)
      ? workout.tags
      : [workout.tags];
    return tags.some((tag) =>
      workoutTagsArray.some((workoutTag) => hasPartialMatch(tag, workoutTag)),
    );
  });

  console.log(
    `[${new Date().toISOString()}] Found partial matches: ${partialMatches.length}`,
  );
  return getRandomSelection(partialMatches, count);
}

function combineUniqueWorkouts(exactMatches, partialMatches, count) {
  const uniqueWorkouts = new Map();
  [...exactMatches, ...partialMatches].forEach((workout) =>
    uniqueWorkouts.set(workout.id, workout),
  );

  const recommendedWorkouts = Array.from(uniqueWorkouts.values());
  return count
    ? getRandomSelection(recommendedWorkouts, count)
    : recommendedWorkouts;
}

// Helper function to format workout data consistently
function formatWorkoutData(doc) {
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
}
