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
    const startTime = new Date();
    console.log(`[${startTime.toISOString()}] Start: Received request.`);

    const recipesRef = firestore.collection("recipes");
    const userRef = firestore.collection("users").doc(context.auth.uid);

    // Step 1: Determine tags to use for filtering recipes
    let tagsToUseNotNormalized =
      mealTags && mealTags.length > 0
        ? mealTags
        : await fetchUserRecipeTags(userRef);

    const tagsToUse = tagsToUseNotNormalized.map((tag) => tag.toLowerCase());

    // Step 2: Fetch exact matches for the tagsToUse
    const exactMatchRecipes = await fetchExactMatchRecipes(
      tagsToUse,
      recipesRef,
      count,
    );

    if (count && exactMatchRecipes.length >= count) {
      console.log(
        `[${new Date().toISOString()}] Exact matches satisfy the count.`,
      );
      return exactMatchRecipes;
    }

    // Step 3: Fetch partial matches if more recipes are needed
    const additionalNeeded = count ? count - exactMatchRecipes.length : 0;
    const partialMatchRecipes =
      additionalNeeded > 0
        ? await fetchPartialMatchRecipes(
            tagsToUse,
            recipesRef,
            additionalNeeded,
          )
        : [];

    // Combine exact and partial matches, ensuring uniqueness
    const recommendedRecipes = combineUniqueRecipes(
      exactMatchRecipes,
      partialMatchRecipes,
      count,
    );

    const endTime = new Date();
    console.log(
      `[${endTime.toISOString()}] Finished processing. Total time: ${(endTime - startTime) / 1000} seconds.`,
    );
    return recommendedRecipes;
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] Error recommending recipes:`,
      error,
    );
    throw new functions.https.HttpsError(
      "internal",
      "Unable to recommend recipes",
    );
  }
});

// Helper functions
async function fetchUserRecipeTags(userRef) {
  const userDoc = await userRef.get();
  const userData = userDoc.data();
  const userRecipePreferences = [
    ...(userData.nutritionCategories?.recipeTags || []),
  ];
  console.log(
    `[${new Date().toISOString()}] Using tags from user preferences:`,
    userRecipePreferences,
  );
  return userRecipePreferences.length > 0 ? userRecipePreferences : ["easy"];
}

async function fetchExactMatchRecipes(tags, recipesRef, count) {
  const exactMatchSnapshot = await recipesRef
    .where("tags", "array-contains-any", tags)
    .get();
  const exactMatchRecipes = exactMatchSnapshot.docs.map((doc) =>
    formatRecipeData(doc),
  );
  console.log(
    `[${new Date().toISOString()}] Fetched exact matches: ${exactMatchRecipes.length}`,
  );
  return getRandomSelection(exactMatchRecipes, count);
}

async function fetchPartialMatchRecipes(tags, recipesRef, count) {
  const allRecipesSnapshot = await recipesRef.get();
  const allRecipes = allRecipesSnapshot.docs.map((doc) =>
    formatRecipeData(doc),
  );

  const partialMatches = allRecipes.filter((recipe) => {
    const recipeTagsArray = Array.isArray(recipe.tags)
      ? recipe.tags
      : [recipe.tags];
    return tags.some((tag) =>
      recipeTagsArray.some((recipeTag) => hasPartialMatch(tag, recipeTag)),
    );
  });

  console.log(
    `[${new Date().toISOString()}] Found partial matches: ${partialMatches.length}`,
  );
  return getRandomSelection(partialMatches, count);
}

function combineUniqueRecipes(exactMatches, partialMatches, count) {
  const uniqueRecipes = new Map();
  [...exactMatches, ...partialMatches].forEach((recipe) =>
    uniqueRecipes.set(recipe.id, recipe),
  );

  const recommendedRecipes = Array.from(uniqueRecipes.values());
  return count
    ? getRandomSelection(recommendedRecipes, count)
    : recommendedRecipes;
}

// Helper function to format recipe data consistently
function formatRecipeData(doc) {
  const data = doc.data();
  return {
    id: doc.id,
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
