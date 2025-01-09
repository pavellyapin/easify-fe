const functions = require("firebase-functions");
const admin = require("firebase-admin");

const firestore = admin.firestore();

exports.filterWorkouts = functions.https.onCall(async (data, context) => {
  const {
    categories = [],
    levels = [],
    isNew = false,
    sortBy = "createdDate",
    count = 10,
    lastWorkout = null, // To support batch loading (pagination)
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
    console.log("Starting workout filtering with parameters:", {
      categories,
      levels,
      isNew,
      sortBy,
      count,
      lastWorkout,
    });

    let workoutsQuery = firestore.collection("workouts");

    // Apply category filter if provided
    if (categories.length > 0) {
      console.log("Applying category filter:", categories);
      workoutsQuery = workoutsQuery.where("category", "in", categories);
    }

    // Apply level filter if provided
    if (levels.length > 0) {
      console.log("Applying level filter:", levels);
      workoutsQuery = workoutsQuery.where("level", "in", levels);
    }

    // Apply isNew filter if provided
    if (isNew) {
      console.log("Applying isNew filter: true");
      workoutsQuery = workoutsQuery.where("isNew", "==", true);
    }

    // Sort workouts by createdDate (or other provided field)
    if (sortBy) {
      console.log(`Applying sorting by ${sortBy} in descending order`);
      workoutsQuery = workoutsQuery.orderBy(sortBy, "desc");
    }

    // If `lastWorkout` is provided, use `startAfter` for pagination
    if (lastWorkout) {
      console.log(
        "Applying pagination, starting after lastWorkout:",
        lastWorkout,
      );
      const lastWorkoutDoc = await firestore
        .collection("workouts")
        .doc(lastWorkout.id)
        .get();
      if (lastWorkoutDoc.exists) {
        console.log("lastWorkout found in Firestore, applying startAfter");
        workoutsQuery = workoutsQuery.startAfter(lastWorkoutDoc);
      } else {
        console.warn("lastWorkout not found in Firestore, skipping pagination");
      }
    }

    // Fetch the next batch of `count` workouts
    console.log(`Fetching the next batch of ${count} workouts`);
    const workoutsSnapshot = await workoutsQuery.limit(count).get();

    // Check if any workouts were retrieved
    if (workoutsSnapshot.empty) {
      console.log("No workouts found for the current filters");
      return { workouts: [], lastWorkout: null };
    }

    // Transform the workouts data into an array in the desired format
    const workouts = workoutsSnapshot.docs.map((doc) => {
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

    console.log("Found and processed workouts:", workouts.length);

    // Return the filtered and sorted workouts, with metadata for the last workout
    return {
      workouts,
      lastWorkout: workouts.length > 0 ? workouts[workouts.length - 1] : null, // Send the last workout for the next batch
    };
  } catch (error) {
    console.error("Error filtering workouts:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Unable to filter workouts",
    );
  }
});
