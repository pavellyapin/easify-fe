/* eslint-disable no-undef */
const functions = require("firebase-functions");
const admin = require("firebase-admin");

const firestore = admin.firestore();

exports.normalizeIngredientsAndAddToTagCounts = functions.firestore
  .document("commands/{commandId}")
  .onCreate(async (snap) => {
    const commandData = snap.data();

    // Only execute if the command name is "normalizeIngredients"
    if (commandData.name !== "normalizeIngredients") {
      return null;
    }

    try {
      const recipesRef = firestore.collection("recipes");
      const allRecipesSnapshot = await recipesRef.get();

      // Initialize an empty Set to store unique normalized ingredient names
      const ingredientSet = new Set();

      // Go through each recipe document and normalize the ingredients
      const updatePromises = allRecipesSnapshot.docs.map(async (doc) => {
        const docData = doc.data();

        if (docData.ingredients && Array.isArray(docData.ingredients)) {
          const normalizedIngredients = docData.ingredients.map(
            (ingredient) => {
              const normalizedIngredientName = ingredient.name
                .trim()
                .toLowerCase();
              // Add to Set for tagCounts
              ingredientSet.add(normalizedIngredientName);
              return {
                ...ingredient,
                name: normalizedIngredientName,
              };
            },
          );

          // Update the recipe with normalized ingredients
          await doc.ref.update({
            ingredients: normalizedIngredients,
          });
        }
      });

      // Wait for all updates to complete
      await Promise.all(updatePromises);

      // Convert the Set to an array and prepare it for Firestore
      const ingredientArray = Array.from(ingredientSet);

      // Get the tagCounts document reference for recipe ingredients
      const tagCountsRef = firestore
        .collection("tagCounts")
        .doc("recipeIngredients");

      // Add the normalized ingredients to the tagCounts document
      await tagCountsRef.set(
        {
          ingredients: admin.firestore.FieldValue.arrayUnion(
            ...ingredientArray,
          ),
        },
        { merge: true },
      );

      console.log(
        "Ingredients normalized and added to tagCounts successfully.",
      );
    } catch (error) {
      console.error(
        "Error normalizing ingredients and adding to tagCounts:",
        error,
      );
    }
  });
