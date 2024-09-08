/* eslint-disable no-undef */
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { getRandomSelection, hasPartialMatch } = require("../utils");

const firestore = admin.firestore();

exports.recommendRecipes = functions.https.onCall(async (data, context) => {
  const { mealTags, count } = data;

  if (!context.auth) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "The function must be called while authenticated.",
    );
  }

  try {
    const recipesRef = firestore.collection("recipes");

    const recipesQuerySnapshot = await recipesRef
      .where("tags", "array-contains-any", mealTags)
      .get();

    const recipes = recipesQuerySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        createdDate: data.createdDate,
        name: data.name,
        description: data.description,
        difficulty: data.difficulty,
        cuisine: data.cuisine,
        image: data.image,
        tags: data.tags,
      };
    });

    const allRecipesSnapshot = await recipesRef.get();
    const allRecipes = allRecipesSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        createdDate: data.createdDate,
        name: data.name,
        description: data.description,
        difficulty: data.difficulty,
        cuisine: data.cuisine,
        image: data.image,
        tags: data.tags,
      };
    });

    const additionalRecipes = allRecipes.filter((recipe) => {
      return mealTags.some((tag) =>
        recipe.tags.some(
          (recipeTag) =>
            !recipes.find((r) => r.id === recipe.id) &&
            hasPartialMatch(tag, recipeTag),
        ),
      );
    });

    const uniqueRecipes = new Map();
    [...recipes, ...additionalRecipes].forEach((recipe) => {
      uniqueRecipes.set(recipe.id, recipe);
    });

    let recommendedRecipes = Array.from(uniqueRecipes.values());

    if (count) {
      recommendedRecipes = getRandomSelection(recommendedRecipes, count);
    }

    return recommendedRecipes;
  } catch (error) {
    console.error("Error recommending recipes:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Unable to recommend recipes",
    );
  }
});
