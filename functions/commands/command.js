/* eslint-disable no-undef */
const functions = require("firebase-functions");
const admin = require("firebase-admin");

const firestore = admin.firestore();

exports.cleanUpRecipesWithoutImages = functions.firestore
  .document("commands/{commandId}")
  .onCreate(async (snap) => {
    const commandData = snap.data();

    if (commandData.name !== "cleanupRecipesWithoutImages") {
      console.log(
        "Command name is not 'cleanupRecipesWithoutImages'. Exiting.",
      );
      return null;
    }

    console.log("Starting cleanup operation...");

    try {
      const recipesRef = firestore.collection("recipes");

      // References to the tagCounts documents
      const tagsRef = firestore.collection("tagCounts").doc("recipeTags");
      const cuisinesRef = firestore
        .collection("tagCounts")
        .doc("recipeCuisines");
      const categoriesRef = firestore
        .collection("tagCounts")
        .doc("recipeCategories");

      // Fetch the current tagCounts data
      const [tagsDoc, cuisinesDoc, categoriesDoc] = await Promise.all([
        tagsRef.get(),
        cuisinesRef.get(),
        categoriesRef.get(),
      ]);

      let tagsData = tagsDoc.exists ? tagsDoc.data()?.tags || {} : {};
      let cuisinesData = cuisinesDoc.exists
        ? cuisinesDoc.data()?.cuisines || {}
        : {};
      let categoriesData = categoriesDoc.exists
        ? categoriesDoc.data()?.categories || {}
        : {};

      const recipesSnapshot = await recipesRef.get();

      if (recipesSnapshot.empty) {
        console.log("No recipes found. Exiting.");
        return null;
      }

      const batch = firestore.batch();
      let deleteCount = 0;

      recipesSnapshot.forEach((doc) => {
        const recipe = doc.data();

        if (!recipe.image) {
          console.log(`Deleting recipe: ${recipe.name} (ID: ${doc.id})`);

          // Update category count
          if (recipe.category && categoriesData[recipe.category]) {
            categoriesData[recipe.category] = Math.max(
              categoriesData[recipe.category] - 1,
              0,
            );
          }

          // Update cuisine count
          if (recipe.cuisine && cuisinesData[recipe.cuisine]) {
            cuisinesData[recipe.cuisine] = Math.max(
              cuisinesData[recipe.cuisine] - 1,
              0,
            );
          }

          // Update tags count
          if (recipe.tags && Array.isArray(recipe.tags)) {
            recipe.tags.forEach((tag) => {
              if (tagsData[tag]) {
                tagsData[tag] = Math.max(tagsData[tag] - 1, 0);
              }
            });
          }

          // Add recipe deletion to the batch
          batch.delete(doc.ref);
          deleteCount++;
        }
      });

      if (deleteCount > 0) {
        console.log(`Deleting ${deleteCount} recipes without images...`);
        await batch.commit();

        console.log("Updating tag counts...");

        // Save the updated tagCounts back to Firestore
        await Promise.all([
          tagsRef.set({ tags: tagsData }, { merge: true }),
          cuisinesRef.set({ tags: cuisinesData }, { merge: true }),
          categoriesRef.set({ tags: categoriesData }, { merge: true }),
        ]);

        console.log("Cleanup operation completed successfully.");
      } else {
        console.log("No recipes without images found.");
      }
    } catch (error) {
      console.error("Error during cleanup operation:", error);
    }
  });
