// Firebase Admin SDK initialization
const admin = require("firebase-admin");
admin.initializeApp();

// Recipe-related functions
const { recommendRecipes } = require("./recipes/recommendRecipes");
const { recipeOnCreate } = require("./recipes/recipeOnCreate");
const { filterRecipes } = require("./recipes/filterRecipes");
const { findRecipesByIngredients } = require("./recipes/recipesByIngredients");
const { resizeRecipeImage } = require("./recipes/recipeImageOnUpload");
const { recipeKeywordSearch } = require("./recipes/recipeKeywordSearch");

// Course-related functions
const { recommendCourses } = require("./courses/recommendCourses");
const { courseOnCreate } = require("./courses/courseOnCreate");
const { resizeCourseImage } = require("./courses/courseImageOnUpload");
const { updateIsNewFlagForCourses } = require("./courses/addNewLabel");
const { filterCourses } = require("./courses/filterCourses");

// Plan-related functions
const { recommendFinancialPlans } = require("./financial/recommendPlans");
const { financialPlanOnCreate } = require("./financial/planOnCreate");

// Fitness and workout-related functions
const { recommendWorkouts } = require("./fitness/recommendWorkouts");
const { workoutOnCreate } = require("./fitness/workoutOnCreate");
const { resizeWorkoutImage } = require("./fitness/workoutImageOnUpload");
const { updateIsNewFlagForWorkouts } = require("./fitness/addNewLabel");
const { filterWorkouts } = require("./fitness/filterWorkouts");

// Growth and career-related functions
const {
  analyzeResumeAndMatchIndustries,
} = require("./growth/analyzeResumeAndMatchIndustries");
const { industryOnCreate } = require("./growth/industryOnCreate");
const { recommendIndustries } = require("./growth/recommendIndustries");

//User function
const { onUserCreate } = require("./user/userOnCreate");
const { onUserUpdate } = require("./user/userOnUpdate");
const { onUserCourseCreateOrUpdate } = require("./user/userCourseOnCreate");
const { onCourseStatsUpdate } = require("./user/userCourseStatsOnUpdate");
const {
  addChallengesToAllUsersOnCommand,
} = require("./user/userAddChallenges");
const { onUserWorkoutCreateOrUpdate } = require("./user/userWorkoutOnCreate");
const { onWorkoutStatsUpdate } = require("./user/userWorkoutStatsOnUpdate");
const { onUserRecipeCreateOrUpdate } = require("./user/userRecipeOnCreate");
const { onRecipeStatsUpdate } = require("./user/userRecipeStatsOnUpdate");
//Daily functions
const { onScheduleCreate } = require("./daily/scheduleOnCreate");
const { onDailyStatsUpdate } = require("./daily/scheduleStatsOnUpdate");

// Command-related functions (e.g., counting workout tags and categories)
const { cleanUpRecipesWithoutImages } = require("./commands/command");

// Export: Daily related
exports.onScheduleCreate = onScheduleCreate;
exports.onDailyStatsUpdate = onDailyStatsUpdate;

// Export: User-related
exports.onUserCreate = onUserCreate;
exports.onUserCourseCreateOrUpdate = onUserCourseCreateOrUpdate;
exports.onCourseStatsUpdate = onCourseStatsUpdate;
exports.addChallengesToAllUsersOnCommand = addChallengesToAllUsersOnCommand;
exports.onUserUpdate = onUserUpdate;
exports.onUserWorkoutCreateOrUpdate = onUserWorkoutCreateOrUpdate;
exports.onWorkoutStatsUpdate = onWorkoutStatsUpdate;
exports.onUserRecipeCreateOrUpdate = onUserRecipeCreateOrUpdate;
exports.onRecipeStatsUpdate = onRecipeStatsUpdate;
// Exports: Recipe-related
exports.recommendRecipes = recommendRecipes;
exports.recipeOnCreate = recipeOnCreate;
exports.filterRecipes = filterRecipes;
exports.findRecipesByIngredients = findRecipesByIngredients;
exports.resizeRecipeImage = resizeRecipeImage;
exports.recipeKeywordSearch = recipeKeywordSearch;

// Exports: Course-related
exports.recommendCourses = recommendCourses;
exports.courseOnCreate = courseOnCreate;
exports.resizeCourseImage = resizeCourseImage;
exports.updateIsNewFlagForCourses = updateIsNewFlagForCourses;
exports.filterCourses = filterCourses;

// Exports: plan-related
exports.recommendFinancialPlans = recommendFinancialPlans;
exports.financialPlanOnCreate = financialPlanOnCreate;

// Exports: Fitness and workout-related
exports.recommendWorkouts = recommendWorkouts;
exports.workoutOnCreate = workoutOnCreate;
exports.resizeWorkoutImage = resizeWorkoutImage;
exports.updateIsNewFlagForWorkouts = updateIsNewFlagForWorkouts;
exports.filterWorkouts = filterWorkouts;

// Exports: Growth and career-related
exports.analyzeResumeAndMatchIndustries = analyzeResumeAndMatchIndustries;
exports.industryOnCreate = industryOnCreate;
exports.recommendIndustries = recommendIndustries;

// Exports: Command-related
exports.cleanUpRecipesWithoutImages = cleanUpRecipesWithoutImages;
