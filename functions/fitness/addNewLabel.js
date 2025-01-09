/* eslint-disable no-undef */
const functions = require("firebase-functions");
const admin = require("firebase-admin");

const firestore = admin.firestore();

// Function to clear isNew from all workouts and then add it to workouts created in the last 24 hours
exports.updateIsNewFlagForWorkouts = functions.firestore
  .document("commands/{commandId}")
  .onCreate(async (snap) => {
    const commandData = snap.data();

    // Only execute if the command name is "updateIsNewFlagForWorkouts"
    if (commandData.name !== "updateIsNewFlagForWorkouts") {
      return null;
    }

    try {
      const now = admin.firestore.Timestamp.now();
      const oneDayAgo = new Date(now.toDate().getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
      const workoutsRef = firestore.collection("workouts");

      // Step 1: Clear the `isNew` flag from all workouts that have it set to true
      const isNewWorkoutsSnapshot = await workoutsRef
        .where("isNew", "==", true)
        .get();

      const clearPromises = []; // To store promises for clearing `isNew`

      isNewWorkoutsSnapshot.docs.forEach((doc) => {
        // Remove the `isNew` flag
        const updatedData = {
          ...doc.data(),
          isNew: false, // Set `isNew` to false
        };

        // Update the workout
        clearPromises.push(doc.ref.update(updatedData));
      });

      await Promise.all(clearPromises);
      console.log(
        `Cleared "isNew" flag from ${clearPromises.length} workouts.`,
      );

      // Step 2: Fetch all workouts and filter by `createTime`
      const allWorkoutsSnapshot = await workoutsRef.get();

      const updatePromises = []; // To store update promises for recent workouts

      allWorkoutsSnapshot.docs.forEach((doc) => {
        const workoutData = doc.data();
        const createdTime = doc.createTime.toDate(); // Get Firestore document creation time

        // Only update if the workout was created in the last 24 hours
        if (createdTime >= oneDayAgo) {
          // Add the "new" label and the "isNew" flag
          const updatedData = {
            ...workoutData,
            isNew: true, // Set the `isNew` flag at the root level
          };

          // Create an update promise for this workout
          updatePromises.push(doc.ref.update(updatedData));
        }
      });

      // Execute all update operations for new workouts
      await Promise.all(updatePromises);

      console.log(
        `Added "new" label and isNew flag to ${updatePromises.length} workouts created in the last 24 hours.`,
      );
    } catch (error) {
      console.error(
        "Error updating 'isNew' flag and labels for workouts:",
        error,
      );
    }
  });
