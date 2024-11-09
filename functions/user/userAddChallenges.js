/* eslint-disable no-undef */
const functions = require("firebase-functions");
const admin = require("firebase-admin");

const firestore = admin.firestore();

exports.addChallengesToAllUsersOnCommand = functions.firestore
  .document("commands/{commandId}")
  .onCreate(async (snap) => {
    const commandData = snap.data();

    // Only execute if the command name is "addChallengesToAllUsers"
    if (commandData.name !== "addChallengesToAllUsers") {
      console.log(`Command name is not "addChallengesToAllUsers". Skipping.`);
      return null;
    }

    const challenges = [
      {
        type: "daily",
        level: 1,
        title: "Complete Your Profile",
        description:
          "Fill out all sections of your profile to get started with personalized recommendations.",
        steps: {
          basicInfo: 1, // Complete basic info
          workSkills: 1, // Add your work skills
          resume: 1, // Upload a resume
          lifestyle: 1, // Fill out lifestyle information
          diet: 1, // Add dietary preferences
          financialPlanning: 1, // Add financial planning info
          moreInfo: 1, // Complete any additional information
        },
        progress: 0,
        status: "incomplete",
      },
      {
        type: "daily",
        level: 2,
        title: "Regular User",
        description: "Login a total of 3 times to become a regular user.",
        steps: { totalLogins: 3 }, // Login for 3 consecutive days
        progress: 0,
        status: "incomplete",
      },
      {
        type: "daily",
        level: 3,
        title: "5-Day Login Streak",
        description:
          "Log in daily for three consecutive days to maintain your progress and stay on track.",
        steps: { loginStreak: 5 }, // Login for 3 consecutive days
        progress: 0,
        status: "incomplete",
      },
      {
        type: "daily",
        level: 4,
        title: "7-Day Login Streak",
        description:
          "Log in daily for a full week and reinforce your learning routine.",
        steps: { loginStreak: 7 }, // Login for 7 consecutive days
        progress: 0,
        status: "incomplete",
      },
    ];

    try {
      // Get all users
      const usersSnapshot = await firestore.collection("users").get();
      const batch = firestore.batch(); // Batch to optimize the write process

      // Loop through each user and add challenges to their collection
      usersSnapshot.forEach((userDoc) => {
        const userRef = firestore.collection("users").doc(userDoc.id);
        const challengesRef = userRef.collection("challenges");

        // Loop through the hardcoded challenges and add each to the user's challenges collection
        challenges.forEach((challenge) => {
          const challengeRef = challengesRef.doc(); // Auto-generate the document ID
          batch.set(challengeRef, { ...challenge });
        });
      });

      // Commit the batch operation
      await batch.commit();

      console.log(`Challenges successfully added to all users.`);
      return { message: "Challenges added to all users." };
    } catch (error) {
      console.error("Error adding challenges to all users:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Error adding challenges.",
      );
    }
  });
