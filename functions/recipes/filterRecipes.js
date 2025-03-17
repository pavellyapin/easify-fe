const functions = require("firebase-functions");
const admin = require("firebase-admin");

const firestore = admin.firestore();

exports.filterRecipes = functions.https.onCall(async (data, context) => {
  const {
    categories = [],
    cuisines = [],
    levels = [],
    isNew = false,
    sortBy = "createdDate",
    count = 10,
    lastRecipe = null, // To support batch loading (pagination)
  } = data;

  // Ensure the user is authenticated
  if (!context.auth) {
    console.error("User is not authenticated");
    throw new functions.https.HttpsError(
      "failed-precondition",
      "The function must be called while authenticated.",
    );
  }

  try {
    console.log("Starting recipe filtering with parameters:", {
      categories,
      cuisines,
      levels,
      isNew,
      sortBy,
      count,
      lastRecipe,
    });

    let recipesQuery = firestore.collection("recipes");

    // Apply category filter if provided
    if (categories.length > 0) {
      console.log("Applying category filter:", categories);
      recipesQuery = recipesQuery.where("category", "in", categories);
    }

    // Apply cuisine filter if provided
    if (cuisines.length > 0) {
      console.log("Applying cuisine filter:", cuisines);
      recipesQuery = recipesQuery.where("cuisine", "in", cuisines);
    }

    // Apply level filter if provided
    if (levels.length > 0) {
      console.log("Applying level filter:", levels);
      recipesQuery = recipesQuery.where("level", "in", levels);
    }

    // Apply isNew filter if provided
    if (isNew) {
      console.log("Applying isNew filter: true");
      recipesQuery = recipesQuery.where("isNew", "==", true);
    }

    // Sort recipes by createdDate (or other provided field)
    if (sortBy) {
      console.log(`Applying sorting by ${sortBy} in descending order`);
      recipesQuery = recipesQuery.orderBy(sortBy, "desc");
    }

    // If `lastRecipe` is provided, use `startAfter` for pagination
    if (lastRecipe) {
      console.log(
        "Applying pagination, starting after lastRecipe:",
        lastRecipe,
      );
      const lastRecipeDoc = await firestore
        .collection("recipes")
        .doc(lastRecipe.id)
        .get();
      if (lastRecipeDoc.exists) {
        console.log("lastRecipe found in Firestore, applying startAfter");
        recipesQuery = recipesQuery.startAfter(lastRecipeDoc);
      } else {
        console.warn("lastRecipe not found in Firestore, skipping pagination");
      }
    }

    // Fetch the next batch of `count` recipes
    console.log(`Fetching the next batch of ${count} recipes`);
    const recipesSnapshot = await recipesQuery
      .select(
        "createdDate",
        "name",
        "isNew",
        "category",
        "cuisine",
        "description",
        "totalTime",
        "level",
        "image",
        "tags",
      )
      .limit(count)
      .get();

    // Check if any recipes were retrieved
    if (recipesSnapshot.empty) {
      console.log("No recipes found for the current filters");
      return { recipes: [], lastRecipe: null };
    }

    // Transform the recipes data into an array in the desired format
    const recipes = recipesSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        createdDate: data.createdDate,
        name: data.name,
        isNew: data.isNew,
        category: data.category,
        cuisine: data.cuisine,
        description: data.description,
        totalTime: data.totalTime,
        level: data.level,
        image: data.image,
        tags: data.tags,
      };
    });

    console.log("Found and processed recipes:", recipes.length);

    // Return the filtered and sorted recipes, with metadata for the last recipe
    return {
      recipes,
      lastRecipe: recipes.length > 0 ? recipes[recipes.length - 1] : null, // Send the last recipe for the next batch
    };
  } catch (error) {
    console.error("Error filtering recipes:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Unable to filter recipes",
    );
  }
});
