/* eslint-disable no-undef */
const functions = require("firebase-functions");
const admin = require("firebase-admin");

const firestore = admin.firestore();

exports.onScheduleCreate = functions.firestore
  .document("users/{userId}/schedules/{scheduleId}")
  .onCreate(async (snap, context) => {
    const scheduleData = snap.data();
    const userId = context.params.userId;
    const scheduleId = context.params.scheduleId; // This is the date in the format "YYYY-MM-DD"

    if (!scheduleData) {
      console.error("No schedule data available");
      return;
    }

    try {
      // Reference to the user's stats document
      const userStatsRef = firestore
        .collection("users")
        .doc(userId)
        .collection("stats")
        .doc("dailyStats");

      const userStatsDoc = await userStatsRef.get();
      let userStats = userStatsDoc.exists
        ? userStatsDoc.data()
        : { totalLogins: 0, loginStreak: 1, lastLoginDate: null };

      // Increment the total logins
      userStats.totalLogins += 1;

      // Update the lastLoginDate to the current schedule date (i.e., scheduleId)
      userStats.lastLoginDate = scheduleId;

      // Get yesterday's date in the same format as scheduleId (YYYY-MM-DD)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayId = yesterday.toISOString().split("T")[0];

      // Check if a schedule for yesterday exists in the user's schedules collection
      const yesterdayScheduleRef = firestore
        .collection("users")
        .doc(userId)
        .collection("schedules")
        .doc(yesterdayId);

      const yesterdayScheduleDoc = await yesterdayScheduleRef.get();

      if (yesterdayScheduleDoc.exists) {
        // If yesterday's schedule exists, increment the login streak
        userStats.loginStreak += 1;
      } else {
        // If yesterday's schedule does not exist, reset the login streak to 1
        userStats.loginStreak = 1;
      }

      // Store the updated stats back to Firestore
      await userStatsRef.set(userStats, { merge: true });

      console.log(`User ${userId}'s stats updated successfully.`);
    } catch (error) {
      console.error("Error updating user stats:", error);
    }
  });
