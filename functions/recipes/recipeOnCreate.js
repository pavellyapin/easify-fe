/* eslint-disable no-undef */
const functions = require("firebase-functions");
const admin = require("firebase-admin");

const firestore = admin.firestore();

exports.recipeOnCreate = functions.firestore
  .document("recipes/{recipeId}")
  .onCreate(async (snap) => {
    const recipeData = snap.data();
    const keywords = recipeData.tags || [];
    const ingredients = recipeData.ingredients || [];

    try {
      const keywordCountsRef = firestore
        .collection("tagCounts")
        .doc("recipeKeywords");

      const ingredientCountsRef = firestore
        .collection("tagCounts")
        .doc("recipeIngredients");

      const [keywordCountsDoc, ingredientCountsDoc] = await Promise.all([
        keywordCountsRef.get(),
        ingredientCountsRef.get(),
      ]);

      let keywordCounts = keywordCountsDoc.exists
        ? keywordCountsDoc.data().tags
        : [];

      let ingredientCounts = ingredientCountsDoc.exists
        ? ingredientCountsDoc.data().ingredients
        : [];

      // Convert the array of objects into a map for easier manipulation
      const keywordCountsMap = new Map(
        keywordCounts.map((item) => [item.tag, item.count]),
      );

      const ingredientCountsMap = new Map(
        ingredientCounts.map((item) => [item.ingredient, item.count]),
      );

      // Update the keyword counts in the map
      keywords.forEach((keyword) => {
        const normalizedKeyword = keyword.toLowerCase();
        if (keywordCountsMap.has(normalizedKeyword)) {
          keywordCountsMap.set(
            normalizedKeyword,
            keywordCountsMap.get(normalizedKeyword) + 1,
          );
        } else {
          keywordCountsMap.set(normalizedKeyword, 1);
        }
      });

      // Update the ingredient counts in the map
      ingredients.forEach((ingredientObj) => {
        const normalizedIngredient = ingredientObj.name.toLowerCase().trim();
        if (ingredientCountsMap.has(normalizedIngredient)) {
          ingredientCountsMap.set(
            normalizedIngredient,
            ingredientCountsMap.get(normalizedIngredient) + 1,
          );
        } else {
          ingredientCountsMap.set(normalizedIngredient, 1);
        }
      });

      // Convert the maps back to arrays of objects
      keywordCounts = Array.from(keywordCountsMap, ([tag, count]) => ({
        tag,
        count,
      }));

      ingredientCounts = Array.from(
        ingredientCountsMap,
        ([ingredient, count]) => ({
          ingredient,
          count,
        }),
      );

      // Sort the arrays by count in descending order
      keywordCounts.sort((a, b) => b.count - a.count);
      ingredientCounts.sort((a, b) => b.count - a.count);

      // Store the sorted arrays back in Firestore
      await Promise.all([
        keywordCountsRef.set({ tags: keywordCounts }),
        ingredientCountsRef.set({ ingredients: ingredientCounts }),
      ]);

      console.log(
        "Keyword and ingredient counts updated and sorted successfully.",
      );
    } catch (error) {
      console.error("Error updating keyword and ingredient counts:", error);
    }
  });
