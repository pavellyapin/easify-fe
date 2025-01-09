/* eslint-disable no-undef */
const functions = require("firebase-functions");
const admin = require("firebase-admin");

const firestore = admin.firestore();

exports.recipeOnCreate = functions.firestore
  .document("recipes/{recipeId}")
  .onCreate(async (snap) => {
    const recipeData = snap.data();
    const tags = recipeData.tags || [];
    const ingredients = recipeData.ingredients || [];
    const cuisine = recipeData.cuisine || "unknown"; // Default to 'unknown' if no cuisine provided
    const category = recipeData.category || "unknown"; // Default to 'unknown' if no category provided

    try {
      const tagCountsRef = firestore.collection("tagCounts").doc("recipeTags");

      const ingredientCountsRef = firestore
        .collection("tagCounts")
        .doc("recipeIngredients");

      const cuisineCountsRef = firestore
        .collection("tagCounts")
        .doc("recipeCuisines");

      const categoryCountsRef = firestore
        .collection("tagCounts")
        .doc("recipeCategories");

      console.log("Fetching existing counts from Firestore...");
      const [
        tagCountsDoc,
        ingredientCountsDoc,
        cuisineCountsDoc,
        categoryCountsDoc,
      ] = await Promise.all([
        tagCountsRef.get(),
        ingredientCountsRef.get(),
        cuisineCountsRef.get(),
        categoryCountsRef.get(),
      ]);

      console.log("Existing counts fetched successfully.");

      let tagCounts = tagCountsDoc.exists ? tagCountsDoc.data().tags : [];
      let ingredientNames = ingredientCountsDoc.exists
        ? ingredientCountsDoc.data().ingredients
        : [];
      let cuisineCounts = cuisineCountsDoc.exists
        ? cuisineCountsDoc.data().cuisines
        : [];
      let categoryCounts = categoryCountsDoc.exists
        ? categoryCountsDoc.data().categories
        : [];

      // Convert the arrays of objects into maps for easier manipulation
      const tagCountsMap = new Map(
        tagCounts.map((item) => [item.tag, item.count]),
      );

      const cuisineCountsMap = new Map(
        cuisineCounts.map((item) => [item.cuisine, item.count]),
      );

      const categoryCountsMap = new Map(
        categoryCounts.map((item) => [item.category, item.count]),
      );

      console.log("Normalized maps created.");

      // Update the tag counts in the map
      tags.forEach((tag) => {
        const normalizedTag = tag.toLowerCase();
        if (tagCountsMap.has(normalizedTag)) {
          tagCountsMap.set(normalizedTag, tagCountsMap.get(normalizedTag) + 1);
        } else {
          tagCountsMap.set(normalizedTag, 1);
        }
      });

      ingredients.forEach((ingredientObj) => {
        // Normalize by removing digits, special characters, and anything in parentheses
        let normalizedIngredient = ingredientObj.name
          .toLowerCase()
          .trim()
          .replace(/\([^)]*\)/g, "") // Remove parentheses and content inside them
          .replace(/[^a-z\s]/g, "") // Remove digits and special characters, retain spaces and letters
          .replace(/\s+/g, " ") // Replace multiple spaces with a single space
          .trim(); // Trim again to ensure no leading/trailing spaces

        if (
          !ingredientNames.includes(normalizedIngredient) &&
          normalizedIngredient !== ""
        ) {
          ingredientNames.push(normalizedIngredient); // Add only unique and non-empty ingredients
        }
      });

      // Update the cuisine counts in the map
      const normalizedCuisine = cuisine.toLowerCase().trim();
      if (cuisineCountsMap.has(normalizedCuisine)) {
        cuisineCountsMap.set(
          normalizedCuisine,
          cuisineCountsMap.get(normalizedCuisine) + 1,
        );
      } else {
        cuisineCountsMap.set(normalizedCuisine, 1);
      }

      // Update the category counts in the map
      const normalizedCategory = category.toLowerCase().trim();
      if (categoryCountsMap.has(normalizedCategory)) {
        categoryCountsMap.set(
          normalizedCategory,
          categoryCountsMap.get(normalizedCategory) + 1,
        );
      } else {
        categoryCountsMap.set(normalizedCategory, 1);
      }

      // Convert the maps back to arrays of objects
      tagCounts = Array.from(tagCountsMap, ([tag, count]) => ({
        tag,
        count,
      }));

      cuisineCounts = Array.from(cuisineCountsMap, ([cuisine, count]) => ({
        cuisine,
        count,
      }));

      categoryCounts = Array.from(categoryCountsMap, ([category, count]) => ({
        category,
        count,
      }));

      console.log("Converted maps back to arrays.");

      // Sort the arrays by count in descending order
      tagCounts.sort((a, b) => b.count - a.count);
      cuisineCounts.sort((a, b) => b.count - a.count);
      categoryCounts.sort((a, b) => b.count - a.count);

      console.log("Sorted arrays of counts.");

      // Store the sorted arrays back in Firestore
      await Promise.all([
        tagCountsRef.set({ tags: tagCounts }),
        ingredientCountsRef.set({ ingredients: ingredientNames }),
        cuisineCountsRef.set({ cuisines: cuisineCounts }),
        categoryCountsRef.set({ categories: categoryCounts }),
      ]);

      console.log(
        "Tag, ingredient, cuisine, and category counts updated and sorted successfully.",
      );
    } catch (error) {
      console.error(
        "Error updating tag, ingredient, cuisine, and category counts:",
        error,
      );
    }
  });
