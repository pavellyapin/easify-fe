/* eslint-disable no-undef */
const functions = require("firebase-functions");
const admin = require("firebase-admin");

const firestore = admin.firestore();

exports.onEasifyResponseCreateOrUpdate = functions.firestore
  .document("users/{userId}/easifyResponses/{responseId}")
  .onWrite(async (change, context) => {
    const userId = context.params.userId;
    const beforeResponse = change.before.exists ? change.before.data() : null;
    const afterResponse = change.after.exists ? change.after.data() : null;

    if (!afterResponse) {
      console.error("No response data available.");
      return;
    }

    console.log("User ID:", userId);
    console.log("Before Response Data:", JSON.stringify(beforeResponse));
    console.log("After Response Data:", JSON.stringify(afterResponse));

    try {
      // Reference to the user's stats document for easifyResponses
      const userStatsRef = firestore
        .collection("users")
        .doc(userId)
        .collection("stats")
        .doc("easifyStats");
      const userStatsDoc = await userStatsRef.get();

      let easifyStats = userStatsDoc.data() || {
        responsesCount: 0,
        typeCounts: {}, // Tracks counts for each response type
      };

      const responseType = afterResponse.type || "unknown";

      // Handle new response creation
      if (!beforeResponse) {
        console.log("New response detected.");

        // Increment total response count
        easifyStats.responsesCount += 1;

        // Increment response type count
        easifyStats.typeCounts[responseType] =
          (easifyStats.typeCounts[responseType] || 0) + 1;

        console.log(`Updated response type count for ${responseType}`);
      }

      // Store the updated easify stats back in Firestore
      await userStatsRef.set(easifyStats, { merge: true });

      console.log("Final Updated Easify Stats:", JSON.stringify(easifyStats));
      console.log(`Easify stats updated for user ${userId}`);
    } catch (error) {
      console.error("Error updating user easify stats:", error);
    }
  });
