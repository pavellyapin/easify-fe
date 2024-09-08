const admin = require("firebase-admin");
admin.initializeApp();

const { recommendRecipes } = require("./recipes/recommendRecipes");
const { recommendCourses } = require("./courses/recommendCourses");
const { courseOnCreate } = require("./courses/courseOnCreate");
const { recipeOnCreate } = require("./recipes/recipeOnCreate");
const { recommendWorkouts } = require("./fitness/recommendWorkouts");
const { workoutOnCreate } = require("./fitness/workoutOnCreate");
const { findRecipesByIngredients } = require("./recipes/recipesByIngredients");
const { normalizeIngredientsAndAddToTagCounts } = require("./commands/command");

exports.recommendRecipes = recommendRecipes;
exports.recommendCourses = recommendCourses;
exports.courseOnCreate = courseOnCreate;
exports.recipeOnCreate = recipeOnCreate;
exports.recommendWorkouts = recommendWorkouts;
exports.workoutOnCreate = workoutOnCreate;
exports.findRecipesByIngredients = findRecipesByIngredients;
exports.normalizeIngredientsAndAddToTagCounts =
  normalizeIngredientsAndAddToTagCounts;
