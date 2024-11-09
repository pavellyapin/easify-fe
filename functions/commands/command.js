/* eslint-disable no-undef */
const functions = require("firebase-functions");
const admin = require("firebase-admin");

const firestore = admin.firestore();

exports.normalizeCourseResources = functions.firestore
  .document("commands/{commandId}")
  .onCreate(async (snap) => {
    const commandData = snap.data();

    // Only execute if the command name is "normalizeCourseResources"
    if (commandData.name !== "normalizeCourseResources") {
      return null;
    }

    try {
      const coursesRef = firestore.collection("courses");
      const allCoursesSnapshot = await coursesRef.get();

      const updatePromises = [];

      // Loop through all courses and normalize the additionalResources field
      allCoursesSnapshot.docs.forEach((doc) => {
        const courseData = doc.data();
        let { additionalResources } = courseData;

        // Normalize additionalResources to an array of strings
        if (Array.isArray(additionalResources)) {
          additionalResources = additionalResources.flatMap((resource) => {
            // If resource is an object with a "title" attribute, use the title
            if (typeof resource === "object" && resource.title) {
              return resource.title;
            }
            // If resource is an object with a "titles" array, return each title
            if (
              typeof resource === "object" &&
              Array.isArray(resource.titles)
            ) {
              return resource.titles;
            }
            // Otherwise, assume it's already a string and return it
            return resource;
          });
        } else {
          // If additionalResources is not an array, make it an empty array
          additionalResources = [];
        }

        // Prepare the updated data with normalized additionalResources
        const updatedData = {
          additionalResources: additionalResources, // Normalized additional resources
        };

        // Add update promise to the array
        updatePromises.push(doc.ref.update(updatedData));
      });

      // Execute all update operations
      await Promise.all(updatePromises);

      console.log(
        `Normalized additionalResources for ${updatePromises.length} courses.`,
      );
    } catch (error) {
      console.error("Error normalizing additionalResources:", error);
    }
  });
