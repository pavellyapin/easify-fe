/* eslint-disable no-undef */
const functions = require("firebase-functions");
const admin = require("firebase-admin");

const firestore = admin.firestore();

exports.onPortfolioStatsUpdate = functions.firestore
  .document("users/{userId}/stats/portfolioStats")
  .onUpdate(async (change, context) => {
    const newStats = change.after.data();
    const userId = context.params.userId;

    console.log(`onPortfolioStatsUpdate triggered for user ${userId}`);
    console.log(`New Stats: ${JSON.stringify(newStats)}`);

    try {
      // Reference to the user's challenges collection
      const challengesRef = firestore
        .collection("users")
        .doc(userId)
        .collection("challenges");

      // Query to find the first incomplete "invest" challenge, sorted by level
      const challengesSnapshot = await challengesRef
        .where("type", "==", "invest")
        .where("progress", "<", 100)
        .orderBy("level")
        .limit(1)
        .get();

      if (challengesSnapshot.empty) {
        console.log(
          `No incomplete 'invest' type challenges found for user ${userId}.`,
        );
        return;
      }

      const challengeDoc = challengesSnapshot.docs[0];
      const challengeData = challengeDoc.data();

      console.log(`Updating challenge: ${challengeDoc.id} for user ${userId}`);
      console.log(`Challenge Data: ${JSON.stringify(challengeData)}`);

      // Extract stats data
      const {
        inProgressPortfolios,
        completePortfolios,
        completeRiskLevelCounts,
        inProgressRiskLevelCounts,
        inProgressCategoryCounts,
        completedCategoryCounts,
      } = newStats;

      const challengeSteps = challengeData.steps;

      console.log("Comparing stats to challenge steps...");
      console.log(`Challenge Steps: ${JSON.stringify(challengeSteps)}`);

      // Initialize progress tracking
      let progressStepsCompleted = 0;
      const totalSteps = Object.keys(challengeSteps).length;

      // Initialize the completed steps array if not present
      if (!challengeData.completedSteps) {
        challengeData.completedSteps = [];
      }

      // Compare stats to the challenge steps
      for (const [key, requiredValue] of Object.entries(challengeSteps)) {
        let currentValue = 0;

        if (key === "inProgressPortfolios") {
          currentValue = inProgressPortfolios;
        } else if (key === "completePortfolios") {
          currentValue = completePortfolios;
        } else if (key in completeRiskLevelCounts) {
          currentValue = completeRiskLevelCounts[key] || 0;
        } else if (key in inProgressRiskLevelCounts) {
          currentValue = inProgressRiskLevelCounts[key] || 0;
        } else if (key in inProgressCategoryCounts) {
          currentValue = inProgressCategoryCounts[key] || 0;
        } else if (key in completedCategoryCounts) {
          currentValue = completedCategoryCounts[key] || 0;
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

      // Calculate the overall progress as a percentage
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
          type: "invest",
          title: "Investment Challenge Completed!",
          message: `Congratulations! You have completed the investment challenge: ${challengeData.title}.`,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          isRead: false,
        };

        await notificationsRef.add(notification);
        console.log(
          `Notification for completed investment challenge added for user ${userId}`,
        );
      }
    } catch (error) {
      console.error(
        `Error updating investment challenge based on portfolioStats for user ${userId}:`,
        error,
      );
    }
  });
