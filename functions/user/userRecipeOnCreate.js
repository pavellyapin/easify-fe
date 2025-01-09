/* eslint-disable no-undef */
const functions = require("firebase-functions");
const admin = require("firebase-admin");

const firestore = admin.firestore();

exports.onUserRecipeCreateOrUpdate = functions.firestore
  .document("users/{userId}/recipes/{recipeId}")
  .onWrite(async (change, context) => {
    const beforeRecipe = change.before.exists ? change.before.data() : null;
    const afterRecipe = change.after.exists ? change.after.data() : null;
    const userId = context.params.userId;

    if (!afterRecipe) {
      console.error("No recipe data available");
      return;
    }

    console.log("User ID:", userId);
    console.log("Before Recipe Data:", JSON.stringify(beforeRecipe));
    console.log("After Recipe Data:", JSON.stringify(afterRecipe));

    try {
      const userStatsRef = firestore
        .collection("users")
        .doc(userId)
        .collection("stats")
        .doc("recipeStats");
      const userStatsDoc = await userStatsRef.get();
      let recipeStats = userStatsDoc.data() || {
        totalStartedRecipes: 0,
        totalCompletedRecipes: 0,
        cuisineCounts: {},
        levelCounts: {
          beginner: 0,
          intermediate: 0,
          advanced: 0,
        },
        inProgressLevelCounts: {
          beginner: 0,
          intermediate: 0,
          advanced: 0,
        },
        inProgressCuisineCounts: {},
      };

      console.log("Current Recipe Stats:", JSON.stringify(recipeStats));

      const recipeCuisine = afterRecipe.recipe.cuisine || "general";
      const recipeLevel = (
        afterRecipe.recipe.level || "intermediate"
      ).toLowerCase();

      console.log("Recipe Cuisine:", recipeCuisine);
      console.log("Recipe Level:", recipeLevel);

      // Handle new recipe creation
      if (!beforeRecipe) {
        console.log("New recipe detected.");
        recipeStats.totalStartedRecipes += 1;

        // Increment in-progress counts
        recipeStats.inProgressCuisineCounts[recipeCuisine] =
          (recipeStats.inProgressCuisineCounts[recipeCuisine] || 0) + 1;
        recipeStats.inProgressLevelCounts[recipeLevel] =
          (recipeStats.inProgressLevelCounts[recipeLevel] || 0) + 1;

        console.log(
          `Updated in-progress counts: Cuisine (${recipeCuisine}), Level (${recipeLevel})`,
        );
      }

      // Handle recipe completion
      if (
        afterRecipe.progress.progress === 100 &&
        afterRecipe.status !== "completed"
      ) {
        console.log("Recipe marked as completed.");
        await change.after.ref.update({ status: "completed" });

        recipeStats.totalCompletedRecipes += 1;

        // Increment completed counts
        recipeStats.cuisineCounts[recipeCuisine] =
          (recipeStats.cuisineCounts[recipeCuisine] || 0) + 1;
        recipeStats.levelCounts[recipeLevel] =
          (recipeStats.levelCounts[recipeLevel] || 0) + 1;

        // Decrement in-progress counts
        if (recipeStats.inProgressCuisineCounts[recipeCuisine]) {
          recipeStats.inProgressCuisineCounts[recipeCuisine] -= 1;
          if (recipeStats.inProgressCuisineCounts[recipeCuisine] < 0) {
            recipeStats.inProgressCuisineCounts[recipeCuisine] = 0;
          }
        }
        if (recipeStats.inProgressLevelCounts[recipeLevel]) {
          recipeStats.inProgressLevelCounts[recipeLevel] -= 1;
          if (recipeStats.inProgressLevelCounts[recipeLevel] < 0) {
            recipeStats.inProgressLevelCounts[recipeLevel] = 0;
          }
        }

        console.log(
          `Decremented in-progress counts: Cuisine (${recipeCuisine}), Level (${recipeLevel})`,
        );

        // Add a notification for recipe completion
        const notificationsRef = firestore
          .collection("users")
          .doc(userId)
          .collection("notifications");

        const notification = {
          type: "recipe",
          title: "Recipe Completed!",
          message: `Congratulations on completing the recipe: ${afterRecipe.recipe.name}!`,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          isRead: false,
        };

        await notificationsRef.add(notification);
        console.log(`Completion notification added for user: ${userId}`);
      }

      // Store the updated recipe stats back in Firestore
      await userStatsRef.set(recipeStats, { merge: true });

      console.log("Final Updated Recipe Stats:", JSON.stringify(recipeStats));
      console.log(`Recipe stats updated for user ${userId}`);
    } catch (error) {
      console.error("Error updating user recipe stats:", error);
    }
  });
