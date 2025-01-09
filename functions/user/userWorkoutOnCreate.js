/* eslint-disable no-undef */
const functions = require("firebase-functions");
const admin = require("firebase-admin");

const firestore = admin.firestore();

exports.onUserWorkoutCreateOrUpdate = functions.firestore
  .document("users/{userId}/workouts/{workoutId}")
  .onWrite(async (change, context) => {
    const beforeWorkout = change.before.exists ? change.before.data() : null;
    const afterWorkout = change.after.exists ? change.after.data() : null;
    const userId = context.params.userId;

    if (!afterWorkout) {
      console.error("No workout data available");
      return;
    }

    console.log("User ID:", userId);
    console.log("Before Workout Data:", JSON.stringify(beforeWorkout));
    console.log("After Workout Data:", JSON.stringify(afterWorkout));

    try {
      const userStatsRef = firestore
        .collection("users")
        .doc(userId)
        .collection("stats")
        .doc("workoutStats");
      const userStatsDoc = await userStatsRef.get();
      let workoutStats = userStatsDoc.data() || {
        totalStartedWorkouts: 0,
        totalCompletedWorkouts: 0,
        levelCounts: {},
        categoryCounts: {},
        inProgressLevelCounts: {},
        inProgressCategoryCounts: {},
      };

      console.log("Current Workout Stats:", JSON.stringify(workoutStats));

      const workoutLevel = (
        afterWorkout.workout.level || "intermediate"
      ).toLowerCase();
      const workoutCategory = afterWorkout.workout.category || "general";

      console.log("Workout Level:", workoutLevel);
      console.log("Workout Category:", workoutCategory);

      // Handle new workout creation
      if (!beforeWorkout) {
        console.log("New workout detected.");
        workoutStats.totalStartedWorkouts += 1;

        // Ensure the category exists in inProgressCategoryCounts with a default value of 0
        if (!workoutStats.inProgressCategoryCounts[workoutCategory]) {
          console.log(
            `In-progress category ${workoutCategory} not found. Initializing to 1.`,
          );
          workoutStats.inProgressCategoryCounts[workoutCategory] = 1;
        } else {
          workoutStats.inProgressCategoryCounts[workoutCategory] =
            (workoutStats.inProgressCategoryCounts[workoutCategory] || 0) + 1;
        }

        // Increment in-progress counts
        workoutStats.inProgressLevelCounts[workoutLevel] =
          (workoutStats.inProgressLevelCounts[workoutLevel] || 0) + 1;

        console.log(
          `Updated in-progress counts: Level (${workoutLevel}), Category (${workoutCategory})`,
        );
      }

      // Handle workout completion
      if (
        afterWorkout.progress.progress === 100 &&
        afterWorkout.status !== "completed"
      ) {
        console.log("Workout marked as completed.");
        await change.after.ref.update({ status: "completed" });

        workoutStats.totalCompletedWorkouts += 1;
        // Ensure the category exists in inProgressCategoryCounts with a default value of 0
        if (!workoutStats.categoryCounts[workoutCategory]) {
          console.log(
            `In-progress category ${workoutCategory} not found. Initializing to 1.`,
          );
          workoutStats.categoryCounts[workoutCategory] = 1;
        } else {
          workoutStats.categoryCounts[workoutCategory] =
            (workoutStats.categoryCounts[workoutCategory] || 0) + 1;
        }

        // Increment completed counts
        workoutStats.levelCounts[workoutLevel] =
          (workoutStats.levelCounts[workoutLevel] || 0) + 1;

        console.log(
          `Incremented completed counts: Level (${workoutLevel}), Category (${workoutCategory})`,
        );

        // Decrement in-progress counts
        if (workoutStats.inProgressLevelCounts[workoutLevel]) {
          workoutStats.inProgressLevelCounts[workoutLevel] -= 1;
          if (workoutStats.inProgressLevelCounts[workoutLevel] < 0) {
            workoutStats.inProgressLevelCounts[workoutLevel] = 0; // Prevent negative counts
          }
        }
        if (workoutStats.inProgressCategoryCounts[workoutCategory]) {
          workoutStats.inProgressCategoryCounts[workoutCategory] -= 1;
          if (workoutStats.inProgressCategoryCounts[workoutCategory] < 0) {
            workoutStats.inProgressCategoryCounts[workoutCategory] = 0; // Prevent negative counts
          }
        }

        console.log(
          `Decremented in-progress counts: Level (${workoutLevel}), Category (${workoutCategory})`,
        );

        // Add a notification for workout completion
        const notificationsRef = firestore
          .collection("users")
          .doc(userId)
          .collection("notifications");

        const notification = {
          type: "physical",
          title: "Workout Completed!",
          message: `Congratulations on completing the workout: ${afterWorkout.workout.name}!`,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          isRead: false, // Mark notification as unread
        };

        await notificationsRef.add(notification);
        console.log(`Completion notification added for user: ${userId}`);
      }

      // Store the updated workout stats back in Firestore
      await userStatsRef.set(workoutStats, { merge: true });

      console.log("Final Updated Workout Stats:", JSON.stringify(workoutStats));
      console.log(`Workout stats updated for user ${userId}`);
    } catch (error) {
      console.error("Error updating user workout stats:", error);
    }
  });
