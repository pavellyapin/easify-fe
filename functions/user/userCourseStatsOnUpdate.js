/* eslint-disable no-undef */
const functions = require("firebase-functions");
const admin = require("firebase-admin");

const firestore = admin.firestore();

exports.onCourseStatsUpdate = functions.firestore
  .document("users/{userId}/stats/courseStats")
  .onUpdate(async (change, context) => {
    const newStats = change.after.data();
    const userId = context.params.userId;

    console.log(`onCourseStatsUpdate triggered for user ${userId}`);
    console.log(`New Stats: ${JSON.stringify(newStats)}`);

    try {
      // Reference to the user's challenges collection
      const challengesRef = firestore
        .collection("users")
        .doc(userId)
        .collection("challenges");

      // Query to find the first incomplete "learn" challenge, sorted by level
      const challengesSnapshot = await challengesRef
        .where("type", "==", "learn")
        .where("progress", "<", 100)
        .orderBy("level") // Sorting by level
        .limit(1)
        .get();

      if (challengesSnapshot.empty) {
        console.log(
          `No incomplete 'learn' type challenges found for user ${userId}.`,
        );
        return;
      }

      const challengeDoc = challengesSnapshot.docs[0];
      const challengeData = challengeDoc.data();

      console.log(`Updating challenge: ${challengeDoc.id} for user ${userId}`);
      console.log(`Challenge Data: ${JSON.stringify(challengeData)}`);

      // Extract stats data
      const {
        totalStartedCourses,
        totalCompletedCourses,
        levelCounts,
        categoryCounts,
      } = newStats;
      const challengeSteps = challengeData.steps;

      console.log("Comparing stats to challenge steps...");
      console.log(`Challenge Steps: ${JSON.stringify(challengeSteps)}`);

      // Initialize progress tracking
      let progressStepsCompleted = 0;
      const totalSteps = Object.keys(challengeSteps).length;

      // Initialize the completed steps array if not present
      if (!challengeData.completedSteps) {
        challengeData.completedSteps = []; // Initialize if it doesn't exist
      }

      // If the challenge only has one step, calculate progress for that step
      if (totalSteps === 1) {
        const [key, requiredValue] = Object.entries(challengeSteps)[0]; // Get the key and required value for the single step
        let currentValue = 0;

        if (key === "totalStartedCourses") {
          currentValue = totalStartedCourses;
        } else if (key === "totalCompletedCourses") {
          currentValue = totalCompletedCourses;
        } else if (key in levelCounts) {
          currentValue = levelCounts[key];
        } else if (key in categoryCounts) {
          currentValue = categoryCounts[key] || 0;
        }

        // Calculate progress for the single step
        const newProgress = (currentValue / requiredValue) * 100;
        challengeData.progress = newProgress;

        // Check if the challenge is complete
        if (newProgress >= 100) {
          challengeData.status = "complete";
          if (!challengeData.completedSteps.includes(key)) {
            challengeData.completedSteps.push(key);
          }
          console.log(`Challenge ${challengeDoc.id} marked as complete.`);
        } else {
          console.log(
            `Challenge ${challengeDoc.id} progress updated to ${newProgress}%.`,
          );
        }
      } else {
        // Compare stats to the challenge steps (for multi-step challenges)
        for (const [key, requiredValue] of Object.entries(challengeSteps)) {
          let currentValue = 0;

          if (key === "totalStartedCourses") {
            currentValue = totalStartedCourses;
          } else if (key === "totalCompletedCourses") {
            currentValue = totalCompletedCourses;
          } else if (key in levelCounts) {
            currentValue = levelCounts[key];
          } else if (key in categoryCounts) {
            currentValue = categoryCounts[key] || 0;
          }

          console.log(
            `Checking step: ${key}, Required: ${requiredValue}, Current: ${currentValue}`,
          );

          // Check if the stat meets or exceeds the challenge's required value
          if (currentValue >= requiredValue) {
            progressStepsCompleted += 1;
            // Add the completed step to the array if not already present
            if (!challengeData.completedSteps.includes(key)) {
              challengeData.completedSteps.push(key);
            }
          }
        }

        // Calculate the overall progress as a percentage for multi-step challenges
        const newProgress = (progressStepsCompleted / totalSteps) * 100;
        challengeData.progress = newProgress;

        if (newProgress === 100) {
          challengeData.status = "complete";
          console.log(`Challenge ${challengeDoc.id} marked as complete.`);
        } else {
          console.log(
            `Challenge ${challengeDoc.id} progress updated to ${newProgress}%.`,
          );
        }
      }

      // Update the challenge document with new progress and status
      await challengesRef
        .doc(challengeDoc.id)
        .set(challengeData, { merge: true });

      console.log(
        `Challenge ${challengeDoc.id} updated successfully for user ${userId}`,
      );

      // If the challenge is completed, add a notification
      if (challengeData.status === "complete") {
        const notificationsRef = firestore
          .collection("users")
          .doc(userId)
          .collection("notifications");

        const notification = {
          type: "learn",
          title: "Challenge Completed!",
          message: `Congratulations! You have completed the challenge: ${challengeData.title}.`,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          isRead: false, // Notification is unread by default
        };

        await notificationsRef.add(notification);
        console.log(
          `Notification for completed challenge added for user ${userId}`,
        );
      }
    } catch (error) {
      console.error(
        `Error updating challenge based on courseStats for user ${userId}:`,
        error,
      );
    }
  });
