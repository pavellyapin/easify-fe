/* eslint-disable no-undef */
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { CHALLENGES } = require("./challenges");

const firestore = admin.firestore();

exports.onUserCreate = functions.firestore
  .document("users/{userId}")
  .onCreate(async (snap, context) => {
    const userId = context.params.userId;

    try {
      // Initialize courseStats for the new user
      const userStatsRef = firestore
        .collection("users")
        .doc(userId)
        .collection("stats")
        .doc("courseStats");

      const courseStats = {
        totalStartedCourses: 0,
        totalCompletedCourses: 0,
        levelCounts: {
          beginner: 0,
          intermediate: 0,
          advanced: 0,
        },
        categoryCounts: [],
      };

      // Set the courseStats document in Firestore
      await userStatsRef.set(courseStats);
      console.log(`Course stats initialized for user: ${userId}`);

      // Initialize dailyStats for the new user
      const dailyStatsRef = firestore
        .collection("users")
        .doc(userId)
        .collection("stats")
        .doc("dailyStats");

      const dailyStats = {
        loginStreak: 0, // Tracks consecutive login days
        lastLoginDate: null, // Last login date, to track streaks
        totalLogins: 0, // Total logins for the user
      };

      // Set the dailyStats document in Firestore
      await dailyStatsRef.set(dailyStats);
      console.log(`Daily stats initialized for user: ${userId}`);

      // Reference to the challenges collection for the new user
      const challengesCollectionRef = firestore
        .collection("users")
        .doc(userId)
        .collection("challenges");

      // Add each challenge to the Firestore collection
      const batch = firestore.batch(); // Batch write for efficiency
      CHALLENGES.forEach((challenge) => {
        const challengeDocRef = challengesCollectionRef.doc(); // Auto-generate document ID
        batch.set(challengeDocRef, challenge);
      });

      // Commit the batch write
      await batch.commit();
      console.log(`Challenges added successfully for user: ${userId}`);

      // Add notification for the new user
      const notificationsRef = firestore
        .collection("users")
        .doc(userId)
        .collection("notifications");

      const notification = {
        type: "user",
        title: "Welcome to the platform!",
        message:
          "Your account has been successfully created. Start exploring challenges and courses now!",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        isRead: false, // Mark notification as unread
      };

      await notificationsRef.add(notification);
      console.log(`Welcome notification added for user: ${userId}`);
    } catch (error) {
      console.error("Error setting up new user data:", error);
    }
  });
