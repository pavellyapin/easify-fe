/* eslint-disable no-undef */
const functions = require("firebase-functions");
const admin = require("firebase-admin");

const firestore = admin.firestore();

exports.recipeKeywordSearch = functions.https.onCall(async (data, context) => {
  const { keyword } = data;

  if (!context.auth) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "The function must be called while authenticated.",
    );
  }

  if (!keyword || typeof keyword !== "string") {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "A valid keyword must be provided.",
    );
  }

  try {
    const startTime = new Date();
    console.log(
      `[${startTime.toISOString()}] Start: Received request with keyword "${keyword}".`,
    );

    const keywordLower = keyword.toLowerCase();
    const recipesRef = firestore.collection("recipes");

    // Fetch only the required fields
    const allRecipesSnapshot = await recipesRef
      .select(
        "name",
        "tags",
        "ingredients",
        "category",
        "cuisine",
        "description",
        "image",
        "level",
        "createdDate",
        "totalTime",
        "isNew",
      )
      .get();
    const allRecipes = allRecipesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Initialize arrays to hold related data
    const matchedRecipes = [];
    const relatedCuisines = new Set();
    const relatedCategories = new Set();
    const relatedIngredients = new Set();

    // Filter recipes by keyword and collect related data
    allRecipes.forEach((recipe) => {
      const { name, tags, ingredients, category, cuisine } = recipe;

      let isMatch = false;

      // Check name
      if (name && name.toLowerCase().includes(keywordLower)) {
        isMatch = true;
      }

      // Check tags
      if (
        tags &&
        tags.some((tag) => tag.toLowerCase().includes(keywordLower))
      ) {
        isMatch = true;
      }

      // Check ingredients
      const matchingIngredients =
        ingredients &&
        ingredients.filter((ingredient) =>
          ingredient.name.toLowerCase().includes(keywordLower),
        );

      if (matchingIngredients && matchingIngredients.length > 0) {
        isMatch = true;
      }

      // Check category
      const categoryMatches =
        category && category.toLowerCase().includes(keywordLower);

      if (categoryMatches) {
        isMatch = true;
      }

      // Check cuisine
      const cuisineMatches =
        cuisine && cuisine.toLowerCase().includes(keywordLower);

      if (cuisineMatches) {
        isMatch = true;
      }

      if (isMatch) {
        matchedRecipes.push(formatRecipeData(recipe));

        // Add only the matching attributes
        if (cuisineMatches) relatedCuisines.add(cuisine);
        if (categoryMatches) relatedCategories.add(category);
        if (matchingIngredients) {
          matchingIngredients.forEach((ingredient) =>
            relatedIngredients.add(ingredient.name),
          );
        }
      }
    });

    const endTime = new Date();
    console.log(
      `[${endTime.toISOString()}] Found ${matchedRecipes.length} recipes matching keyword "${keyword}". Total time: ${
        (endTime - startTime) / 1000
      } seconds.`,
    );

    return {
      recipes: matchedRecipes,
      relatedCuisines: Array.from(relatedCuisines),
      relatedCategories: Array.from(relatedCategories),
      relatedIngredients: Array.from(relatedIngredients),
      keyword: keywordLower,
    };
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] Error searching recipes:`,
      error,
    );
    throw new functions.https.HttpsError(
      "internal",
      "Unable to search for recipes.",
    );
  }
});

// Helper function to format recipe data consistently
function formatRecipeData(data) {
  return {
    id: data.id,
    createdDate: data.createdDate,
    name: data.name,
    description: data.description,
    level: data.level,
    category: data.category,
    totalTime: data.totalTime,
    cuisine: data.cuisine,
    isNew: data.isNew,
    image: data.image,
    tags: data.tags,
  };
}
