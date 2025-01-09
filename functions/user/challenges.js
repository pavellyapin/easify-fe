const LEARN_CHALLENGES = [
  {
    type: "learn",
    level: 1,
    title: "First Steps",
    description: "Start and complete your first course",
    steps: { totalStartedCourses: 1, totalCompletedCourses: 1 },
    progress: 0,
    status: "incomplete",
  },
  {
    type: "learn",
    level: 2,
    title: "Course Explorer",
    description: "Explore and start courses from two different categories",
    steps: { categoryCounts: 2 },
    progress: 0,
    status: "incomplete",
  },
  {
    type: "learn",
    level: 3,
    title: "All-Rounder",
    description:
      "Complete courses at all skill levels: beginner, intermediate, and advanced",
    steps: { beginner: 1, intermediate: 1, advanced: 1 },
    progress: 0,
    status: "incomplete",
  },
];

const DAILY_CHALLENGES = [
  {
    type: "daily",
    level: 1,
    title: "Complete Your Profile",
    description:
      "Fill out all sections of your profile for personalized recommendations.",
    steps: {
      basicInfo: 1,
      workSkills: 1,
      resume: 1,
      lifestyleHealth: 1,
      dietNutrition: 1,
      financialPlanning: 1,
      moreInfo: 1,
    },
    progress: 0,
    status: "incomplete",
  },
  {
    type: "daily",
    level: 2,
    title: "Regular User",
    description: "Login a total of 3 times to become a regular user.",
    steps: { totalLogins: 3 },
    progress: 0,
    status: "incomplete",
  },
  {
    type: "daily",
    level: 3,
    title: "5-Day Login Streak",
    description: "Log in daily for five consecutive days.",
    steps: { loginStreak: 5 },
    progress: 0,
    status: "incomplete",
  },
  {
    type: "daily",
    level: 4,
    title: "7-Day Login Streak",
    description: "Log in daily for a full week.",
    steps: { loginStreak: 7 },
    progress: 0,
    status: "incomplete",
  },
  {
    type: "daily",
    level: 5,
    title: "Monthly Commitment",
    description: "Log in daily for an entire month.",
    steps: { loginStreak: 30 },
    progress: 0,
    status: "incomplete",
  },
];

const PHYSICAL_CHALLENGES = [
  {
    type: "physical",
    level: 1,
    title: "First Workout",
    description: "Complete your first workout session.",
    steps: { totalStartedWorkouts: 1, totalCompletedWorkouts: 1 },
    progress: 0,
    status: "incomplete",
  },
  {
    type: "physical",
    level: 2,
    title: "Consistency",
    description: "Complete a workout on three different levels.",
    steps: { beginner: 1, intermediate: 1, advanced: 1 },
    progress: 0,
    status: "incomplete",
  },
  {
    type: "physical",
    level: 3,
    title: "Fitness Routine",
    description: "Establish a routine by completing workouts of 2 categories.",
    steps: { categoryCounts: 2 },
    progress: 0,
    status: "incomplete",
  },
];

const CHALLENGES = [
  ...LEARN_CHALLENGES,
  ...DAILY_CHALLENGES,
  ...PHYSICAL_CHALLENGES,
];

module.exports = {
  CHALLENGES,
};
