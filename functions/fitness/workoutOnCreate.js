/* eslint-disable no-undef */
const functions = require("firebase-functions");
const admin = require("firebase-admin");

const firestore = admin.firestore();

exports.workoutOnCreate = functions.firestore
  .document("workouts/{workoutId}")
  .onCreate(async (snap) => {
    const workoutData = snap.data();
    const tags = workoutData.tags || [];
    const category = workoutData.category || "uncategorized"; // Default to 'uncategorized' if no category provided

    try {
      const tagCountsRef = firestore.collection("tagCounts").doc("workoutTags");
      const categoryCountsRef = firestore
        .collection("tagCounts")
        .doc("workoutCategory");

      const [tagCountsDoc, categoryCountsDoc] = await Promise.all([
        tagCountsRef.get(),
        categoryCountsRef.get(),
      ]);

      let tagCounts = tagCountsDoc.exists ? tagCountsDoc.data().tags : [];
      let categoryCounts = categoryCountsDoc.exists
        ? categoryCountsDoc.data().categories
        : [];

      // Convert the arrays of objects into maps for easier manipulation
      const tagCountsMap = new Map(
        tagCounts.map((item) => [item.tag, item.count]),
      );
      const categoryCountsMap = new Map(
        categoryCounts.map((item) => [item.category, item.count]),
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

      // Update the category count in the map
      const normalizedCategory = category.toLowerCase();
      if (categoryCountsMap.has(normalizedCategory)) {
        categoryCountsMap.set(
          normalizedCategory,
          categoryCountsMap.get(normalizedCategory) + 1,
        );
      } else {
        categoryCountsMap.set(normalizedCategory, 1);
      }

      // Convert the maps back to arrays of objects
      tagCounts = Array.from(tagCountsMap, ([tag, count]) => ({ tag, count }));
      categoryCounts = Array.from(categoryCountsMap, ([category, count]) => ({
        category,
        count,
      }));

      // Sort the arrays by count in descending order
      tagCounts.sort((a, b) => b.count - a.count);
      categoryCounts.sort((a, b) => b.count - a.count);

      // Store the sorted arrays back in Firestore
      await Promise.all([
        tagCountsRef.set({ tags: tagCounts }),
        categoryCountsRef.set({ categories: categoryCounts }),
      ]);

      console.log("Tag and category counts updated and sorted successfully.");
    } catch (error) {
      console.error("Error updating tag and category counts:", error);
    }
  });
