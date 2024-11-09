const CHALLENGES = [
  {
    type: "learn",
    level: 1,
    title: "First Steps",
    description: "Start and complete your first course",
    steps: { totalStartedCourses: 1, totalCompletedCourses: 1 }, // User needs to start and complete one course
    progress: 0,
    status: "incomplete",
  },
  {
    type: "learn",
    level: 2,
    title: "Course Explorer",
    description: "Explore and start courses from two different categories",
    steps: { categoryCounts: 2 }, // User needs to start courses from at least two categories
    progress: 0,
    status: "incomplete",
  },
  {
    type: "learn",
    level: 3,
    title: "All-Rounder",
    description:
      "Complete courses at all skill levels: beginner, intermediate, and advanced",
    steps: { beginner: 1, intermediate: 1, advanced: 1 }, // User needs to complete one course at each skill level
    progress: 0,
    status: "incomplete",
  },
  {
    type: "daily",
    level: 1,
    title: "Complete Your Profile",
    description:
      "Fill out all sections of your profile to get started with personalized recommendations.",
    steps: {
      basicInfo: 1, // Complete basic info
      workSkills: 1, // Add your work skills
      resume: 1, // Upload a resume
      lifestyleHealth: 1, // Fill out lifestyle information
      dietNutrition: 1, // Add dietary preferences
      financialPlanning: 1, // Add financial planning info
      moreInfo: 1, // Complete any additional information
    },
    progress: 0,
    status: "incomplete",
  },
  {
    type: "daily",
    level: 2,
    title: "Regular User",
    description: "Login a total of 3 times to become a regular user.",
    steps: { totalLogins: 3 }, // Login for 3 consecutive days
    progress: 0,
    status: "incomplete",
  },
  {
    type: "daily",
    level: 3,
    title: "5-Day Login Streak",
    description:
      "Log in daily for three consecutive days to maintain your progress and stay on track.",
    steps: { loginStreak: 5 }, // Login for 3 consecutive days
    progress: 0,
    status: "incomplete",
  },
  {
    type: "daily",
    level: 4,
    title: "7-Day Login Streak",
    description:
      "Log in daily for a full week and reinforce your learning routine.",
    steps: { loginStreak: 7 }, // Login for 7 consecutive days
    progress: 0,
    status: "incomplete",
  },
  {
    type: "daily",
    level: 5,
    title: "Monthly Commitment",
    description: "Log in at least once every day for an entire month.",
    steps: { loginStreak: 30 }, // Login for 7 consecutive days
    progress: 0,
    status: "incomplete",
  },
];

module.exports = {
  CHALLENGES,
};
