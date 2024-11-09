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
    const userRef = firestore.collection("users").doc(context.auth.uid);

    let tagsToUse = mealTags;

    // If no mealTags are provided, fetch user's started recipes and/or preferences
    if (!mealTags || mealTags.length === 0) {
      console.log("No mealTags provided. Fetching started recipes.");

      // Fetch the user's started recipes under users/{userId}/recipes
      const startedRecipesSnapshot = await firestore
        .collection(`users/${context.auth.uid}/recipes`)
        .get();

      const startedRecipes = startedRecipesSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          tags: data.tags || [],
        };
      });

      // Extract tags from started recipes if they exist
      const startedRecipeTags = startedRecipes.reduce((acc, recipe) => {
        return acc.concat(recipe.tags);
      }, []);

      if (startedRecipeTags.length > 0) {
        console.log("Using tags from started recipes:", startedRecipeTags);
        tagsToUse = startedRecipeTags;
      } else {
        // If no started recipes or tags, fetch user preferences for recipes
        console.log("No tags from started recipes, fetching user preferences.");

        const userDoc = await userRef.get();
        const userData = userDoc.data();

        const userNutrition = userData.nutritionCategories || {};
        tagsToUse = userNutrition.recipeTags || [];

        console.log("Using tags from user's recipe preferences:", tagsToUse);
      }
    }

    if (tagsToUse.length === 0) {
      console.log("No tags available, returning all recipes.");

      // Fetch all recipes
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

      // If count is specified, return a random selection of recipes
      if (count) {
        return getRandomSelection(allRecipes, count);
      }

      return allRecipes;
    }

    console.log("Tags to use for fetching recipes:", tagsToUse);

    // Fetch recipes that match any of the tagsToUse
    const recipesQuerySnapshot = await recipesRef
      .where("tags", "array-contains-any", tagsToUse)
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

    console.log("Found recipes matching tags:", recipes.length);

    // Fetch all recipes for broader filtering
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

    // Filter additional recipes based on partial tag matches
    const additionalRecipes = allRecipes.filter((recipe) => {
      const recipeTagsArray = Array.isArray(recipe.tags)
        ? recipe.tags
        : [recipe.tags]; // Ensure tags is an array

      return tagsToUse.some((tag) =>
        recipeTagsArray.some((recipeTag) => {
          // Check if the recipe is not already in the list and has a partial tag match
          return (
            !recipes.find((r) => r.id === recipe.id) &&
            hasPartialMatch(tag, recipeTag)
          );
        }),
      );
    });

    console.log(
      "Found additional recipes based on partial matches:",
      additionalRecipes.length,
    );

    // Combine and deduplicate the recipe recommendations
    const uniqueRecipes = new Map();
    [...recipes, ...additionalRecipes].forEach((recipe) => {
      uniqueRecipes.set(recipe.id, recipe);
    });

    let recommendedRecipes = Array.from(uniqueRecipes.values());

    // If count is specified, return a random selection of recipes
    if (count) {
      recommendedRecipes = getRandomSelection(recommendedRecipes, count);
    }

    console.log("Final recommended recipes:", recommendedRecipes.length);

    return recommendedRecipes;
  } catch (error) {
    console.error("Error recommending recipes:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Unable to recommend recipes",
    );
  }
});
