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
const { courseKeywordSearch } = require("./courses/courseKeywordSearch");

// Plan-related functions
const { recommendPortfolios } = require("./financial/recommendPortfolios");
const { financialPlanOnCreate } = require("./financial/planOnCreate");
const { portfolioOnCreate } = require("./financial/portfolioOnCreate");
const { filterPortfolios } = require("./financial/filterPortfolios");
const {
  portfolioKeywordSearch,
} = require("./financial/portfolioKeywordSearch");

// Fitness and workout-related functions
const { recommendWorkouts } = require("./fitness/recommendWorkouts");
const { workoutOnCreate } = require("./fitness/workoutOnCreate");
const { resizeWorkoutImage } = require("./fitness/workoutImageOnUpload");
const { updateIsNewFlagForWorkouts } = require("./fitness/addNewLabel");
const { filterWorkouts } = require("./fitness/filterWorkouts");
const { workoutKeywordSearch } = require("./fitness/workoutKeywordSearch");

// Growth and career-related functions
const {
  analyzeResumeAndMatchIndustries,
} = require("./growth/analyzeResumeAndMatchIndustries");
const { industryOnCreate } = require("./growth/industryOnCreate");
const { recommendIndustries } = require("./growth/recommendIndustries");
const { filterIndustries } = require("./growth/filterIndustries");
const { industryKeywordSearch } = require("./growth/industryKeywordSearch");

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
const { onPortfolioCreateOrUpdate } = require("./user/userPortfolioOnCreate");
const { onPortfolioStatsUpdate } = require("./user/userPortfolioStatsOnUpdate");
//Daily functions
const { onScheduleCreate } = require("./daily/scheduleOnCreate");
const { onDailyStatsUpdate } = require("./daily/scheduleStatsOnUpdate");
const {
  onEasifyResponseCreateOrUpdate,
} = require("./user/userEasifyResponseOnCreate");

// Command-related functions (e.g., counting workout tags and categories)
const { deleteCryptoPortfolios } = require("./commands/command");

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
exports.onUserPortfolioCreateOrUpdate = onPortfolioCreateOrUpdate;
exports.onPortfolioStatsUpdate = onPortfolioStatsUpdate;
exports.onEasifyResponseCreateOrUpdate = onEasifyResponseCreateOrUpdate;
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
exports.courseKeywordSearch = courseKeywordSearch;

// Exports: plan-related
exports.recommendPortfolios = recommendPortfolios;
exports.financialPlanOnCreate = financialPlanOnCreate;
exports.portfolioOnCreate = portfolioOnCreate;
exports.filterPortfolios = filterPortfolios;
exports.portfolioKeywordSearch = portfolioKeywordSearch;

// Exports: Fitness and workout-related
exports.recommendWorkouts = recommendWorkouts;
exports.workoutOnCreate = workoutOnCreate;
exports.resizeWorkoutImage = resizeWorkoutImage;
exports.updateIsNewFlagForWorkouts = updateIsNewFlagForWorkouts;
exports.filterWorkouts = filterWorkouts;
exports.workoutKeywordSearch = workoutKeywordSearch;

// Exports: Growth and career-related
exports.analyzeResumeAndMatchIndustries = analyzeResumeAndMatchIndustries;
exports.industryOnCreate = industryOnCreate;
exports.recommendIndustries = recommendIndustries;
exports.filterIndustries = filterIndustries;
exports.industryKeywordSearch = industryKeywordSearch;

// Exports: Command-related
exports.deleteCryptoPortfolios = deleteCryptoPortfolios;
