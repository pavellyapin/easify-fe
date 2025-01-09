/* eslint-disable no-undef */
const functions = require("firebase-functions");
const admin = require("firebase-admin");

const firestore = admin.firestore();

exports.courseOnCreate = functions.firestore
  .document("courses/{courseId}")
  .onCreate(async (snap) => {
    const courseData = snap.data();
    let { tags = [], category = "" } = courseData;

    try {
      // References to the collections where tag and category counts are stored
      const tagCountsRef = firestore.collection("tagCounts").doc("courseTags");
      const categoryCountsRef = firestore
        .collection("tagCounts")
        .doc("courseCategories");

      // Fetch the current tag counts
      const tagCountsDoc = await tagCountsRef.get();
      let tagCounts = tagCountsDoc.exists ? tagCountsDoc.data().tags : [];

      // Convert the array of objects into a map for easier manipulation (tags)
      const tagCountsMap = new Map(
        tagCounts.map((item) => [item.tag.toLowerCase(), item.count]),
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

      // Convert the map back to an array of objects (tags)
      tagCounts = Array.from(tagCountsMap, ([tag, count]) => ({ tag, count }));

      // Sort the tags array by count in descending order
      tagCounts.sort((a, b) => b.count - a.count);

      // Store the sorted tag array back in Firestore
      await tagCountsRef.set({ tags: tagCounts });

      console.log("Tag counts updated and sorted successfully.");

      // Fetch the current category counts
      const categoryCountsDoc = await categoryCountsRef.get();
      let categoryCounts = categoryCountsDoc.exists
        ? categoryCountsDoc.data().categories
        : [];

      // Convert the array of objects into a map for easier manipulation (categories)
      const categoryCountsMap = new Map(
        categoryCounts.map((item) => [item.category.toLowerCase(), item.count]),
      );

      // Update the category count in the map
      if (category) {
        if (categoryCountsMap.has(category)) {
          categoryCountsMap.set(category, categoryCountsMap.get(category) + 1);
        } else {
          categoryCountsMap.set(category, 1);
        }
      }

      // Convert the map back to an array of objects (categories)
      categoryCounts = Array.from(categoryCountsMap, ([category, count]) => ({
        category,
        count,
      }));

      // Sort the categories array by count in descending order
      categoryCounts.sort((a, b) => b.count - a.count);

      // Store the sorted category array back in Firestore
      await categoryCountsRef.set({ categories: categoryCounts });

      console.log("Category counts updated and sorted successfully.");
    } catch (error) {
      console.error("Error updating tag or category counts:", error);
    }
  });
