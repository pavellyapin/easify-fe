/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Routes } from '@angular/router';
import { ErrorComponent } from '@components/error/error.component';
import { CourseGuard } from 'app/guards/course.guard';
import { GrowthGuard } from 'app/guards/growth.guard';
import { IndustryGuard } from 'app/guards/industry.guard';
import { PortfolioGuard } from 'app/guards/portfolio.guard';
import { RecipeGuard } from 'app/guards/recipe.guard';
import { scheduleGuard } from 'app/guards/schedule.guard';
import { WorkoutGuard } from 'app/guards/workout.guard';
import { loggedIn } from '../guards/auth.guard';

// Recipe-related routes
export const dashboardRecipeRoutes: Routes = [
  {
    path: 'recipes',
    loadComponent: () =>
      import('@dashboard/recipes/recipes.component').then(
        (m) => m.RecipesComponent,
      ),
    data: {
      title: 'Recipes',
      description:
        'Discover and manage delicious recipes tailored to your preferences.',
    },
  },
  {
    path: 'recipe-search-results',
    loadComponent: () =>
      import(
        '@dashboard/recipes/recipe-search-results/recipe-search-results.component'
      ).then((m) => m.RecipeSearchResultsComponent),
    data: {
      title: 'Recipe Search Results',
      description: 'Find recipes based on your search criteria.',
    },
  },
  {
    path: 'recipe/:id',
    canActivate: [RecipeGuard],
    children: [
      {
        path: 'overview',
        loadComponent: () =>
          import(
            '@dashboard/recipes/recipe-overview/recipe-overview.component'
          ).then((m) => m.RecipeOverviewComponent),
        data: {
          title: 'Recipe Overview',
          description:
            'Detailed information and steps for your selected recipe.',
        },
      },
      {
        path: 'instructions',
        loadComponent: () =>
          import(
            '@dashboard/recipes/recipe-instructions/recipe-instructions.component'
          ).then((m) => m.RecipeInstructionsComponent),
        children: [
          {
            path: ':stage/:point',
            loadComponent: () =>
              import(
                '@dashboard/recipes/recipe-instructions/instructions-content/instructions-content.component'
              ).then((m) => m.InstructionsContentComponent),
            data: {
              title: 'Recipe Step',
              description:
                'Step-by-step instructions for your selected recipe.',
            },
          },
          {
            path: ':stage/:point/easify',
            loadComponent: () =>
              import(
                '@dashboard/recipes/recipe-instructions/easify-instruction/easify-instruction.component'
              ).then((m) => m.EasifyInstructionComponent),
            data: {
              title: 'Easify Recipe Step',
              description: 'AI-powered insights to help you cook better.',
            },
          },
          { path: '', redirectTo: '1/1', pathMatch: 'full' },
        ],
      },
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: '**', redirectTo: 'overview' },
    ],
  },
  {
    path: 'recipe-by-ingredients',
    loadComponent: () =>
      import(
        '@dashboard/recipes/recipe-by-ingredients/recipe-by-ingredients.component'
      ).then((m) => m.RecipeByIngredientsComponent),
    data: {
      title: 'Recipe by Ingredients',
      description: 'Find recipes based on ingredients you have.',
    },
  },
  {
    path: 'shopping/:id',
    loadComponent: () =>
      import('@dashboard/recipes/shopping-list/shopping-list.component').then(
        (m) => m.ShoppingListComponent,
      ),
    data: {
      title: 'Shopping List',
      description: 'View and manage your shopping list for recipes.',
    },
  },
];

// Workout-related routes
export const dashboardWorkoutRoutes: Routes = [
  {
    path: 'fitness',
    loadComponent: () =>
      import('@dashboard/fitness/fitness.component').then(
        (m) => m.WorkoutsComponent,
      ),
    data: {
      title: 'Fitness',
      description: 'Explore and manage your personalized fitness plans.',
    },
  },
  {
    path: 'workout-search-results',
    loadComponent: () =>
      import(
        '@dashboard/fitness/workout-search-results/workout-search-results.component'
      ).then((m) => m.WorkoutSearchResultsComponent),
    data: {
      title: 'Fitness',
      description: 'Explore and manage your personalized fitness plans.',
    },
  },
  {
    path: 'workout/:id',
    canActivate: [WorkoutGuard],
    children: [
      {
        path: 'overview',
        loadComponent: () =>
          import(
            '@dashboard/fitness/workout-overview/workout-overview.component'
          ).then((m) => m.WorkoutOverviewComponent),
        data: {
          title: 'Workout Overview',
          description: 'Detailed information about your workout routine.',
        },
      },
      {
        path: 'routine',
        loadComponent: () =>
          import(
            '@dashboard/fitness/workout-routine/workout-routine.component'
          ).then((m) => m.WorkoutRoutineComponent),
        children: [
          {
            path: ':stage/:point',
            loadComponent: () =>
              import(
                '@dashboard/fitness/workout-routine/workout-instructions-content/workout-instructions-content.component'
              ).then((m) => m.WorkoutInstructionsContentComponent),
            data: {
              title: 'Workout Step',
              description:
                'Step-by-step instructions for your selected workout.',
            },
          },
          {
            path: ':stage/:point/easify',
            loadComponent: () =>
              import(
                '@dashboard/fitness/workout-routine/easify-workout-instruction/easify-workout-instruction.component'
              ).then((m) => m.EasifyWorkoutInstructionComponent),
            data: {
              title: 'Easify Workout Insights',
              description: 'AI-powered insights to optimize your workout.',
            },
          },
          { path: '', redirectTo: '1/1', pathMatch: 'full' },
        ],
      },
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: '**', redirectTo: 'overview' },
    ],
  },
];

// Financial planning-related routes
export const dashboardFinancialRoutes: Routes = [
  {
    path: 'financial',
    loadComponent: () =>
      import('@dashboard/financial/financial.component').then(
        (m) => m.FinancialComponent,
      ),
    data: {
      title: 'Financial Planning',
      description:
        'Manage and track your financial goals, portfolios, and savings.',
    },
  },
  {
    path: 'portfolio-search-results',
    loadComponent: () =>
      import(
        '@dashboard/financial/portfolios-search-results/portfolios-search-results.component'
      ).then((m) => m.PortfoliosSearchResultsComponent),
    data: {
      title: 'Portfolio Search Results',
      description: 'Find portfolios based on your investment preferences.',
    },
  },
  {
    path: 'portfolio/:id',
    canActivate: [PortfolioGuard],
    children: [
      {
        path: 'overview',
        loadComponent: () =>
          import(
            '@dashboard/financial/portfolio-overview/portfolio-overview.component'
          ).then((m) => m.PortfolioOverviewComponent),
        data: {
          title: 'Portfolio Overview',
          description: 'Detailed insights into your investment portfolio.',
        },
      },
      {
        path: 'breakdown',
        loadComponent: () =>
          import(
            '@dashboard/financial/portfolio-breakdown/portfolio-breakdown.component'
          ).then((m) => m.PortfolioBreakdownComponent),
        children: [
          {
            path: ':assetClass/:holding',
            loadComponent: () =>
              import(
                '@dashboard/financial/portfolio-breakdown/portfolio-breakdown-content/portfolio-breakdown-content.component'
              ).then((m) => m.PortfolioBreakdownContentComponent),
            data: {
              title: 'Portfolio Overview',
              description: 'Detailed insights into your investment portfolio.',
            },
          },
          {
            path: ':assetClass/:holding/easify',
            loadComponent: () =>
              import(
                '@dashboard/financial/portfolio-breakdown/portfolio-breakdown-easify/portfolio-breakdown-easify.component'
              ).then((m) => m.PortfolioBreakdownEasifyComponent),
            data: {
              title: 'Easify Portfolio Breakdown',
              description: 'AI-powered analysis of your investment holdings.',
            },
          },
        ],
      },
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: '**', redirectTo: 'overview' },
    ],
  },
];

// Personal growth-related routes
export const dashboardPersonalGrowthRoutes: Routes = [
  {
    path: 'personal-growth',
    loadComponent: () =>
      import('@dashboard/personal-growth/personal-growth.component').then(
        (m) => m.PersonalGrowthComponent,
      ),
    data: {
      title: 'Personal Growth',
      description:
        'Improve your skills and track your self-improvement journey.',
    },
    canActivate: [GrowthGuard],
  },
  {
    path: 'industry-search-results',
    loadComponent: () =>
      import(
        '@dashboard/personal-growth/industry-search-results/industry-search-results.component'
      ).then((m) => m.IndustrySearchResultsComponent),
    data: {
      title: 'Industry Search Results',
      description: 'Find industries that align with your career interests.',
    },
  },
  {
    path: 'industry/:id',
    canActivate: [IndustryGuard],
    children: [
      {
        path: 'overview/:part/easify',
        loadComponent: () =>
          import(
            '@dashboard/personal-growth/industry-overview/industry-breakdown-easify/industry-breakdown-easify.component'
          ).then((m) => m.IndustryBreakdownEasifyComponent),
        data: {
          title: 'Industry Overview',
          description: 'Detailed insights and trends about this industry.',
        },
      },
      {
        path: 'overview',
        loadComponent: () =>
          import(
            '@dashboard/personal-growth/industry-overview/industry-overview.component'
          ).then((m) => m.IndustryOverviewComponent),
        data: {
          title: 'Industry Overview',
          description:
            'A high-level overview of industry history, trends, and opportunities.',
        },
      },
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: '**', redirectTo: 'overview' },
    ],
  },
  {
    path: 'resume-upload',
    loadComponent: () =>
      import(
        '@dashboard/personal-growth/resume-upload/resume-upload.component'
      ).then((m) => m.ResumeUploadComponent),
    data: {
      title: 'Resume Upload',
      description: 'Upload and analyze your resume to track career growth.',
    },
  },
];

// Course-related routes
export const dashboardCourseRoutes: Routes = [
  {
    path: 'courses',
    loadComponent: () =>
      import('@dashboard/courses/courses.component').then(
        (m) => m.CoursesComponent,
      ),
    data: {
      title: 'Courses',
      description:
        'Browse and enroll in online courses to expand your knowledge.',
    },
  },
  {
    path: 'course-search-results',
    loadComponent: () =>
      import(
        '@dashboard/courses/courses-search-results/courses-search-results.component'
      ).then((m) => m.CoursesSearchResultsComponent),
    data: {
      title: 'Course Search Results',
      description: 'Find courses based on your search criteria and interests.',
    },
  },
  {
    path: 'course/:id',
    canActivate: [CourseGuard],
    children: [
      {
        path: 'overview',
        loadComponent: () =>
          import(
            '@dashboard/courses/course-overview/course-overview.component'
          ).then((m) => m.CourseOverviewComponent),
        data: {
          title: 'Course Overview',
          description: 'Overview of the course structure and topics.',
        },
      },
      {
        path: 'chapter/:chapter',
        loadComponent: () =>
          import(
            '@dashboard/courses/course-chapter/course-chapter.component'
          ).then((m) => m.CourseChapterComponent),
        data: {
          title: 'Course Chapter',
          description: 'Explore topics covered in this chapter of the course.',
        },
      },
      {
        path: 'chapter/:chapter/:topic',
        loadComponent: () =>
          import('@dashboard/courses/course-topic/course-topic.component').then(
            (m) => m.CourseTopicComponent,
          ),
        data: {
          title: 'Course Topic',
          description:
            'Detailed content and learning materials for this topic.',
        },
        children: [
          {
            path: ':point',
            loadComponent: () =>
              import(
                '@dashboard/courses/course-topic/topic-content/topic-content.component'
              ).then((m) => m.TopicContentComponent),
            data: {
              title: 'Course Point',
              description:
                'Step-by-step learning point within the course topic.',
            },
          },
          {
            path: ':point/easify',
            loadComponent: () =>
              import(
                '@dashboard/courses/course-topic/easify-topic/easify-topic.component'
              ).then((m) => m.EasifyTopicComponent),
            data: {
              title: 'Easify Course Insights',
              description:
                'AI-generated insights to help understand this course topic.',
            },
          },
          { path: '', redirectTo: '1', pathMatch: 'full' },
        ],
      },
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: '**', redirectTo: 'overview' },
    ],
  },
];

export const dashboardCustomDayRoutes: Routes = [
  {
    path: 'custom-day',
    loadComponent: () =>
      import('../dashboard/custom-day/custom-day.component').then(
        (m) => m.CustomDayComponent,
      ),
    data: {
      title: 'Custom Day Planner',
      description: 'Plan and customize your daily schedule for productivity.',
    },
    children: [
      {
        path: 'basic-info',
        loadComponent: () =>
          import(
            '../dashboard/custom-day/basic-info/basic-info.component'
          ).then((m) => m.CustomDayBasicInfoComponent),
        data: {
          title: 'Custom Day - Basic Info',
          description: 'Enter basic details to set up your custom daily plan.',
        },
      },
      {
        path: 'diet-nutrition',
        loadComponent: () =>
          import(
            '../dashboard/custom-day/diet-nutrition/diet-nutrition.component'
          ).then((m) => m.CustomDayDietNutritionComponent),
        data: {
          title: 'Custom Day - Diet & Nutrition',
          description: 'Plan your meals and dietary preferences for the day.',
        },
      },
      {
        path: 'work-skills',
        loadComponent: () =>
          import(
            '../dashboard/custom-day/work-skills/work-skills.component'
          ).then((m) => m.CustomDayWorkSkillsComponent),
        data: {
          title: 'Custom Day - Work & Skills',
          description:
            'Schedule time for work, learning, and skill improvement.',
        },
      },
      {
        path: 'lifestyle-health',
        loadComponent: () =>
          import(
            '../dashboard/custom-day/lifestyle-health/lifestyle-health.component'
          ).then((m) => m.CustomDayLifestyleHealthComponent),
        data: {
          title: 'Custom Day - Lifestyle & Health',
          description:
            'Incorporate exercise, meditation, and healthy habits into your schedule.',
        },
      },
      { path: '', redirectTo: 'basic-info', pathMatch: 'full' },
      { path: '**', redirectTo: 'basic-info' },
    ],
  },
];

// Main dashboard routes, incorporating the modular routes defined above
export const dashboardRoutes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('../dashboard/dashboard.component').then(
        (m) => m.DashboardComponent,
      ),
    canActivate: [loggedIn],
    data: {
      title: 'Dashboard',
      description:
        'Your personal Easify dashboard to manage your tasks, courses, recipes, workouts, and finances.',
    },

    children: [
      {
        path: 'dailylook',
        loadComponent: () =>
          import('../dashboard/daily-look/daily-look.component').then(
            (m) => m.DailyLookComponent,
          ),
        canActivate: [scheduleGuard],
        data: {
          title: 'Daily Look',
          description:
            'View your daily tasks, schedule, and recommendations for a productive day.',
        },
      },
      {
        path: 'refresh',
        loadComponent: () =>
          import('../dashboard/refresh-day/refresh-day.component').then(
            (m) => m.RefreshDayComponent,
          ),
      },
      ...dashboardCustomDayRoutes,
      ...dashboardCourseRoutes,
      ...dashboardRecipeRoutes,
      ...dashboardWorkoutRoutes,
      ...dashboardFinancialRoutes,
      ...dashboardPersonalGrowthRoutes,
      { path: 'error', component: ErrorComponent },
      { path: '**', redirectTo: 'dailylook' }, // Fallback route
    ],
  },
];
