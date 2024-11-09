// Firebase Admin SDK initialization
const admin = require("firebase-admin");
admin.initializeApp();

// Recipe-related functions
const { recommendRecipes } = require("./recipes/recommendRecipes");
const { recipeOnCreate } = require("./recipes/recipeOnCreate");
const { findRecipesByIngredients } = require("./recipes/recipesByIngredients");

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

//Daily functions
const { onScheduleCreate } = require("./daily/scheduleOnCreate");
const { onDailyStatsUpdate } = require("./daily/scheduleStatsOnUpdate");

// Command-related functions (e.g., counting workout tags and categories)
const { normalizeCourseResources } = require("./commands/command");

// Export: Daily related
exports.onScheduleCreate = onScheduleCreate;
exports.onDailyStatsUpdate = onDailyStatsUpdate;

// Export: User-related
exports.onUserCreate = onUserCreate;
exports.onUserCourseCreateOrUpdate = onUserCourseCreateOrUpdate;
exports.onCourseStatsUpdate = onCourseStatsUpdate;
exports.addChallengesToAllUsersOnCommand = addChallengesToAllUsersOnCommand;
exports.onUserUpdate = onUserUpdate;
// Exports: Recipe-related
exports.recommendRecipes = recommendRecipes;
exports.recipeOnCreate = recipeOnCreate;
exports.findRecipesByIngredients = findRecipesByIngredients;

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

// Exports: Growth and career-related
exports.analyzeResumeAndMatchIndustries = analyzeResumeAndMatchIndustries;
exports.industryOnCreate = industryOnCreate;
exports.recommendIndustries = recommendIndustries;

// Exports: Command-related
exports.normalizeCourseResources = normalizeCourseResources;
