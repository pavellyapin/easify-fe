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

    try {
      // Check if course progress is 100% but not marked as completed
      if (
        afterCourse.progress?.progress === 100 &&
        afterCourse.status !== "completed"
      ) {
        // Update the course status to "completed"
        await change.after.ref.update({ status: "completed" });
        afterCourse.status = "completed"; // Ensure afterCourse reflects the updated status
        console.log(`Course status updated to completed for user: ${userId}`);
      }

      const userStatsRef = firestore
        .collection("users")
        .doc(userId)
        .collection("stats")
        .doc("courseStats");
      const userStatsDoc = await userStatsRef.get();

      let courseStats = userStatsDoc.data();

      // Check if this is a new course creation or an update
      if (!beforeCourse) {
        // New course creation (course was not previously started)
        courseStats.totalStartedCourses += 1;
      }

      // Only update if the course is completed
      if (
        afterCourse.status === "completed" &&
        (!beforeCourse || beforeCourse.status !== "completed")
      ) {
        // Update completed course count
        courseStats.totalCompletedCourses += 1;

        // Update level counts based on course level
        const courseLevel = (afterCourse.level || "intermediate").toLowerCase();
        if (courseStats.levelCounts[courseLevel] !== undefined) {
          courseStats.levelCounts[courseLevel] += 1;
        } else {
          courseStats.levelCounts[courseLevel] = 1; // Handle unexpected levels
        }

        // Update category counts based on course category
        const courseCategory = afterCourse.category || "uncategorized";
        if (courseStats.categoryCounts[courseCategory]) {
          courseStats.categoryCounts[courseCategory] += 1;
        } else {
          courseStats.categoryCounts[courseCategory] = 1;
        }

        // Add a notification for course completion
        const notificationsRef = firestore
          .collection("users")
          .doc(userId)
          .collection("notifications");

        const notification = {
          type: "learn",
          title: "Course Completed!",
          message: `Congratulations on completing the course: ${afterCourse.name}!`,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          isRead: false, // Mark notification as unread
        };

        await notificationsRef.add(notification);
        console.log(`Completion notification added for user: ${userId}`);
      }

      // Store the updated course stats back in Firestore
      await userStatsRef.set(courseStats, { merge: true });

      console.log(`Course stats updated for user ${userId}`);
    } catch (error) {
      console.error("Error updating user course stats:", error);
    }
  });
