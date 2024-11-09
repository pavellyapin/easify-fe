/* eslint-disable no-undef */
const functions = require("firebase-functions");
const admin = require("firebase-admin");

const firestore = admin.firestore();

exports.onUserUpdate = functions.firestore
  .document("users/{userId}")
  .onUpdate(async (change, context) => {
    const afterData = change.after.data();
    const userId = context.params.userId;

    // Fields that should be checked for completion
    const formFields = [
      "basicInfo",
      "dietNutrition",
      "financialPlanning",
      "lifestyleHealth",
      "moreInfo",
      "resume",
      "workSkills",
    ];

    try {
      const challengesRef = firestore
        .collection("users")
        .doc(userId)
        .collection("challenges");

      // Fetch the incomplete "form" type challenges
      const challengesSnapshot = await challengesRef
        .where("type", "==", "daily")
        .where("level", "==", 1)
        .limit(1)
        .get();

      if (challengesSnapshot.empty) {
        console.log(`No incomplete 'form' challenges found for user ${userId}`);
        return;
      }

      const challengeDoc = challengesSnapshot.docs[0];
      const challengeData = challengeDoc.data();
      // Check if the challenge status is already "complete"
      if (challengeData.status === "complete") {
        console.log(
          `Challenge ${challengeDoc.id} is already marked as complete for user ${userId}.`,
        );
        return;
      }
      const challengeSteps = challengeData.steps;

      console.log(
        `Updating form challenge: ${challengeDoc.id} for user ${userId}`,
      );
      console.log(`Challenge Data: ${JSON.stringify(challengeData)}`);

      // Initialize the progress calculation
      let completedSteps = 0;
      const totalSteps = Object.keys(challengeSteps).length;

      // Initialize completed steps if not present
      if (!challengeData.completedSteps) {
        challengeData.completedSteps = [];
      }

      // Check each form field and update progress if it exists
      for (const field of formFields) {
        if (afterData[field] != null) {
          // Check if the field exists
          console.log(`Field "${field}" exists in afterData.`);
          if (!challengeData.completedSteps.includes(field)) {
            challengeData.completedSteps.push(field);
            completedSteps += 1;
            console.log(
              `Added "${field}" to completedSteps. Completed steps count: ${completedSteps}`,
            );
          } else {
            console.log(`"${field}" already in completedSteps.`);
            completedSteps += 1; // Count already completed steps
          }
        } else {
          console.log(`Field "${field}" does not exist in afterData.`);
        }
      }

      // Calculate progress percentage
      const newProgress = (completedSteps / totalSteps) * 100;
      challengeData.progress = newProgress;

      // Mark the challenge as complete if all steps are completed
      if (newProgress === 100) {
        challengeData.status = "complete";
        console.log(`Challenge ${challengeDoc.id} marked as complete.`);

        // Add a notification for the completed challenge
        const notificationsRef = firestore
          .collection("users")
          .doc(userId)
          .collection("notifications");

        const notificationData = {
          title: "Challenge Completed",
          message: `You have completed the challenge: ${challengeData.title}`,
          isRead: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        await notificationsRef.add(notificationData);

        console.log(
          `Notification added for completed challenge: ${challengeDoc.id}`,
        );
      }

      // Update the challenge document
      await challengesRef
        .doc(challengeDoc.id)
        .set(challengeData, { merge: true });

      console.log(
        `Challenge ${challengeDoc.id} progress updated to ${newProgress}% for user ${userId}`,
      );
    } catch (error) {
      console.error(`Error updating challenge for user ${userId}:`, error);
    }
  });
