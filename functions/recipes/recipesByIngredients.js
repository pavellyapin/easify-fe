const functions = require("firebase-functions");
const admin = require("firebase-admin");

const firestore = admin.firestore();

exports.findRecipesByIngredients = functions.https.onCall(
  async (data, context) => {
    const { ingredients } = data;

    if (!context.auth) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called while authenticated.",
      );
    }

    try {
      const recipesRef = firestore.collection("recipes");
      const allRecipesSnapshot = await recipesRef.get();

      const matchingRecipes = allRecipesSnapshot.docs
        .map((doc) => {
          const recipeData = doc.data();
          const recipeIngredients = recipeData.ingredients || [];
          // Normalize both recipe ingredients and input ingredients for matching
          const matchedIngredients = recipeIngredients.filter((ingredient) =>
            ingredients.some((inputIngredient) =>
              ingredient.name
                .toLowerCase()
                .includes(inputIngredient.toLowerCase()),
            ),
          ).length;

          return {
            id: doc.id,
            createdDate: recipeData.createdDate,
            name: recipeData.name,
            description: recipeData.description,
            difficulty: recipeData.difficulty,
            cuisine: recipeData.cuisine,
            image: recipeData.image,
            tags: recipeData.tags,
            matchedIngredientsCount: matchedIngredients,
          };
        })
        .filter((recipe) => recipe.matchedIngredientsCount > 0) // Only include recipes with at least one matched ingredient
        .sort((a, b) => b.matchedIngredientsCount - a.matchedIngredientsCount); // Sort by most matched ingredients first

      return matchingRecipes;
    } catch (error) {
      console.error("Error finding recipes by ingredients:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Unable to find recipes by ingredients",
      );
    }
  },
);
