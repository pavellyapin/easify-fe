/* eslint-disable no-undef */
const functions = require("firebase-functions");
const admin = require("firebase-admin");

const firestore = admin.firestore();

// Function to clear isNew from all courses and then add it to courses created in the last 24 hours
exports.updateIsNewFlagForCourses = functions.firestore
  .document("commands/{commandId}")
  .onCreate(async (snap) => {
    const commandData = snap.data();

    // Only execute if the command name is "updateIsNewFlagForCourses"
    if (commandData.name !== "updateIsNewFlagForCourses") {
      return null;
    }

    try {
      const now = admin.firestore.Timestamp.now();
      const oneDayAgo = new Date(now.toDate().getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
      const coursesRef = firestore.collection("courses");

      // Step 1: Clear the `isNew` flag from all courses that have it set to true
      const isNewCoursesSnapshot = await coursesRef
        .where("isNew", "==", true)
        .get();

      const clearPromises = []; // To store promises for clearing `isNew`

      isNewCoursesSnapshot.docs.forEach((doc) => {
        // Remove the `isNew` flag
        const updatedData = {
          ...doc.data(),
          isNew: false, // Set `isNew` to false
        };

        // Update the course
        clearPromises.push(doc.ref.update(updatedData));
      });

      await Promise.all(clearPromises);
      console.log(`Cleared "isNew" flag from ${clearPromises.length} courses.`);

      // Step 2: Fetch all courses and filter by `createTime`
      const allCoursesSnapshot = await coursesRef.get();

      const updatePromises = []; // To store update promises for recent courses

      allCoursesSnapshot.docs.forEach((doc) => {
        const courseData = doc.data();
        const createdTime = doc.createTime.toDate(); // Get Firestore document creation time

        // Only update if the course was created in the last 24 hours
        if (createdTime >= oneDayAgo) {
          // Add the "new" label and the "isNew" flag
          const updatedData = {
            ...courseData,
            isNew: true, // Set the `isNew` flag at the root level
          };

          // Create an update promise for this course
          updatePromises.push(doc.ref.update(updatedData));
        }
      });

      // Execute all update operations for new courses
      await Promise.all(updatePromises);

      console.log(
        `Added "new" label and isNew flag to ${updatePromises.length} courses created in the last 24 hours.`,
      );
    } catch (error) {
      console.error(
        "Error updating 'isNew' flag and labels for courses:",
        error,
      );
    }
  });
