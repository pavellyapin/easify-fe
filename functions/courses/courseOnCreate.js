/* eslint-disable no-undef */
const functions = require("firebase-functions");
const admin = require("firebase-admin");

const firestore = admin.firestore();

exports.courseOnCreate = functions.firestore
  .document("courses/{courseId}")
  .onCreate(async (snap) => {
    const courseData = snap.data();
    const tags = courseData.tags || [];

    try {
      const tagCountsRef = firestore.collection("tagCounts").doc("courseTags");

      const tagCountsDoc = await tagCountsRef.get();
      let tagCounts = tagCountsDoc.exists ? tagCountsDoc.data().tags : [];

      // Convert the array of objects into a map for easier manipulation
      const tagCountsMap = new Map(
        tagCounts.map((item) => [item.tag, item.count]),
      );

      // Update the tag counts in the map
      tags.forEach((tag) => {
        const normalizedTag = tag.toLowerCase();
        if (tagCountsMap.has(normalizedTag)) {
          tagCountsMap.set(normalizedTag, tagCountsMap.get(normalizedTag) + 1);
        } else {
          tagCountsMap.set(normalizedTag, 1);
        }
      });

      // Convert the map back to an array of objects
      tagCounts = Array.from(tagCountsMap, ([tag, count]) => ({ tag, count }));

      // Sort the array by count in descending order
      tagCounts.sort((a, b) => b.count - a.count);

      // Store the sorted array back in Firestore
      await tagCountsRef.set({ tags: tagCounts });

      console.log("Tag counts updated and sorted successfully.");
    } catch (error) {
      console.error("Error updating tag counts:", error);
    }
  });
