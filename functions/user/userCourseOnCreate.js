/* eslint-disable no-undef */
const functions = require("firebase-functions");
const admin = require("firebase-admin");

const firestore = admin.firestore();

exports.onUserCourseCreateOrUpdate = functions.firestore
  .document("users/{userId}/courses/{courseId}")
  .onWrite(async (change, context) => {
    const beforeCourse = change.before.exists ? change.before.data() : null;
    const afterCourse = change.after.exists ? change.after.data() : null;
    const userId = context.params.userId;

    if (!afterCourse) {
      console.error("No course data available");
      return;
    }

    console.log("User ID:", userId);
    console.log("Before Course Data:", JSON.stringify(beforeCourse));
    console.log("After Course Data:", JSON.stringify(afterCourse));

    try {
      const userStatsRef = firestore
        .collection("users")
        .doc(userId)
        .collection("stats")
        .doc("courseStats");
      const userStatsDoc = await userStatsRef.get();
      let courseStats = userStatsDoc.data() || {
        totalStartedCourses: 0,
        totalCompletedCourses: 0,
        levelCounts: {},
        categoryCounts: {},
        inProgressLevelCounts: {},
        inProgressCategoryCounts: {},
      };

      console.log("Current Course Stats:", JSON.stringify(courseStats));

      const courseLevel = (
        afterCourse.course.level || "intermediate"
      ).toLowerCase();
      const courseCategory = afterCourse.course.category || "uncategorized";

      console.log("Course Level:", courseLevel);
      console.log("Course Category:", courseCategory);

      // Handle new course creation
      if (!beforeCourse) {
        console.log("New course detected.");
        courseStats.totalStartedCourses += 1;

        // Ensure the category exists in inProgressCategoryCounts with a default value of 0
        if (!courseStats.inProgressCategoryCounts[courseCategory]) {
          console.log(
            `In-progress category ${courseCategory} not found. Initializing to 1.`,
          );
          courseStats.inProgressCategoryCounts[courseCategory] = 1;
        } else {
          courseStats.inProgressCategoryCounts[courseCategory] =
            (courseStats.inProgressCategoryCounts[courseCategory] || 0) + 1;
        }

        // Increment in-progress counts
        courseStats.inProgressLevelCounts[courseLevel] =
          (courseStats.inProgressLevelCounts[courseLevel] || 0) + 1;

        console.log(
          `Updated in-progress counts: Level (${courseLevel}), Category (${courseCategory})`,
        );
      }

      // Handle course completion
      if (
        afterCourse.progress.progress === 100 &&
        afterCourse.status !== "completed"
      ) {
        console.log("Course marked as completed.");
        await change.after.ref.update({ status: "completed" });

        courseStats.totalCompletedCourses += 1;

        // Ensure the category exists in categoryCounts with a default value of 0
        if (!courseStats.categoryCounts[courseCategory]) {
          console.log(
            `Category ${courseCategory} not found. Initializing to 1.`,
          );
          courseStats.categoryCounts[courseCategory] = 1;
        } else {
          courseStats.categoryCounts[courseCategory] =
            (courseStats.categoryCounts[courseCategory] || 0) + 1;
        }

        // Increment completed counts
        courseStats.levelCounts[courseLevel] =
          (courseStats.levelCounts[courseLevel] || 0) + 1;

        console.log(
          `Incremented completed counts: Level (${courseLevel}), Category (${courseCategory})`,
        );

        // Decrement in-progress counts
        if (courseStats.inProgressLevelCounts[courseLevel]) {
          courseStats.inProgressLevelCounts[courseLevel] -= 1;
          if (courseStats.inProgressLevelCounts[courseLevel] < 0) {
            courseStats.inProgressLevelCounts[courseLevel] = 0; // Prevent negative counts
          }
        }
        if (courseStats.inProgressCategoryCounts[courseCategory]) {
          courseStats.inProgressCategoryCounts[courseCategory] -= 1;
          if (courseStats.inProgressCategoryCounts[courseCategory] < 0) {
            courseStats.inProgressCategoryCounts[courseCategory] = 0; // Prevent negative counts
          }
        }

        console.log(
          `Decremented in-progress counts: Level (${courseLevel}), Category (${courseCategory})`,
        );

        // Add a notification for course completion
        const notificationsRef = firestore
          .collection("users")
          .doc(userId)
          .collection("notifications");

        const notification = {
          type: "learn",
          title: "Course Completed!",
          message: `Congratulations on completing the course: ${afterCourse.course.name}!`,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          isRead: false, // Mark notification as unread
        };

        await notificationsRef.add(notification);
        console.log(`Completion notification added for user: ${userId}`);
      }

      // Store the updated course stats back in Firestore
      await userStatsRef.set(courseStats, { merge: true });

      console.log("Final Updated Course Stats:", JSON.stringify(courseStats));
      console.log(`Course stats updated for user ${userId}`);
    } catch (error) {
      console.error("Error updating user course stats:", error);
    }
  });
