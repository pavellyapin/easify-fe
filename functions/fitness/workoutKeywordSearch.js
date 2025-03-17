const functions = require("firebase-functions");
const admin = require("firebase-admin");

const firestore = admin.firestore();

exports.workoutKeywordSearch = functions.https.onCall(async (data, context) => {
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
    const workoutsRef = firestore.collection("workouts");

    // Fetch only the required fields
    const allWorkoutsSnapshot = await workoutsRef
      .select(
        "name",
        "tags",
        "equipmentNeeded",
        "category",
        "overview",
        "image",
        "level",
        "createdDate",
        "isNew",
      )
      .get();
    const allWorkouts = allWorkoutsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Initialize arrays to hold related data
    const matchedWorkouts = [];
    // eslint-disable-next-line no-undef
    const relatedEquipment = new Set();
    // eslint-disable-next-line no-undef
    const relatedCategories = new Set();

    // Filter workouts by keyword and collect related data
    allWorkouts.forEach((workout) => {
      const { name, tags, equipmentNeeded, overview, category } = workout;

      let isMatch = false;

      // Check name
      if (name && name.toLowerCase().includes(keywordLower)) {
        isMatch = true;
      }

      // Check overview
      if (overview && overview.toLowerCase().includes(keywordLower)) {
        isMatch = true;
      }

      // Check tags
      if (
        tags &&
        tags.some((tag) => tag.toLowerCase().includes(keywordLower))
      ) {
        isMatch = true;
      }

      // Check equipment
      let matchingEquipment = [];
      if (typeof equipmentNeeded === "string") {
        // If equipmentNeeded is a string, check if it matches the keyword
        if (equipmentNeeded.toLowerCase().includes(keywordLower)) {
          isMatch = true;
          matchingEquipment.push(equipmentNeeded);
        }
      } else if (Array.isArray(equipmentNeeded)) {
        // If equipmentNeeded is an array, filter for matching items
        matchingEquipment = equipmentNeeded.filter((equipment) =>
          equipment.toLowerCase().includes(keywordLower),
        );

        if (matchingEquipment.length > 0) {
          isMatch = true;
        }
      }

      // Check category
      const categoryMatches =
        category && category.toLowerCase().includes(keywordLower);

      if (categoryMatches) {
        isMatch = true;
      }

      if (isMatch) {
        matchedWorkouts.push(formatWorkoutData(workout));

        // Add only the matching attributes
        if (categoryMatches) relatedCategories.add(category);
        if (matchingEquipment) {
          matchingEquipment.forEach((equipment) =>
            relatedEquipment.add(equipment),
          );
        }
      }
    });

    const endTime = new Date();
    console.log(
      `[${endTime.toISOString()}] Found ${matchedWorkouts.length} workouts matching keyword "${keyword}". Total time: ${
        (endTime - startTime) / 1000
      } seconds.`,
    );

    return {
      workouts: matchedWorkouts,
      relatedCategories: Array.from(relatedCategories),
      relatedEquipment: Array.from(relatedEquipment),
      keyword: keywordLower,
    };
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] Error searching workouts:`,
      error,
    );
    throw new functions.https.HttpsError(
      "internal",
      "Unable to search for workouts.",
    );
  }
});

// Helper function to format workout data consistently
function formatWorkoutData(data) {
  return {
    id: data.id,
    createdDate: data.createdDate,
    name: data.name,
    isNew: data.isNew,
    category: data.category,
    overview: data.overview,
    level: data.level,
    image: data.image,
    tags: data.tags,
  };
}
