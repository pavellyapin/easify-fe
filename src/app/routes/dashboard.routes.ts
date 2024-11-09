/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Routes } from '@angular/router';
import { ErrorComponent } from 'app/dashboard/error/error.component';
import { CourseGuard } from 'app/guards/course.guard';
import { scheduleGuard } from 'app/guards/schedule.guard';
import { loggedIn } from '../guards/auth.guard';

// Recipe-related routes
export const dashboardRecipeRoutes: Routes = [
  {
    path: 'recipes',
    loadComponent: () =>
      import('@components/recipes/recipes.component').then(
        (m) => m.RecipesComponent,
      ),
  },
  {
    path: 'recipe/:id',
    loadComponent: () =>
      import(
        '@components/recipes/recipe-details/recipe-details.component'
      ).then((m) => m.RecipeDetailsComponent),
  },
  {
    path: 'newRecipe',
    loadComponent: () =>
      import(
        '@components/recipes/recipe-details/recipe-details.component'
      ).then((m) => m.RecipeDetailsComponent),
  },
  {
    path: 'recipe-by-ingredients',
    loadComponent: () =>
      import(
        '@components/recipes/recipe-by-ingredients/recipe-by-ingredients.component'
      ).then((m) => m.RecipeByIngredientsComponent),
  },
  {
    path: 'shopping/:id',
    loadComponent: () =>
      import('@components/recipes/shopping-list/shopping-list.component').then(
        (m) => m.ShoppingListComponent,
      ),
  },
];

// Workout-related routes
export const dashboardWorkoutRoutes: Routes = [
  {
    path: 'fitness',
    loadComponent: () =>
      import('@components/fitness/fitness.component').then(
        (m) => m.WorkoutsComponent,
      ),
  },
  {
    path: 'workout/:id',
    loadComponent: () =>
      import(
        '@components/fitness/workout-details/workout-details.component'
      ).then((m) => m.WorkoutDetailsComponent),
  },
];

// Financial planning-related routes
export const dashboardFinancialRoutes: Routes = [
  {
    path: 'financial',
    loadComponent: () =>
      import('@components/financial/financial.component').then(
        (m) => m.FinancialComponent,
      ),
  },
  {
    path: 'financial-plan/:id',
    loadComponent: () =>
      import(
        '@components/financial/financial-plan-details/financial-plan-details.component'
      ).then((m) => m.FinancialPlanDetailsComponent),
  },
];

// Personal growth-related routes
export const dashboardPersonalGrowthRoutes: Routes = [
  {
    path: 'personal-growth',
    loadComponent: () =>
      import('@components/personal-growth/personal-growth.component').then(
        (m) => m.PersonalGrowthComponent,
      ),
  },
  {
    path: 'resume-upload',
    loadComponent: () =>
      import(
        '@components/personal-growth/resume-upload/resume-upload.component'
      ).then((m) => m.ResumeUploadComponent),
  },
];

// Course-related routes
export const dashboardCourseRoutes: Routes = [
  {
    path: 'courses',
    loadComponent: () =>
      import('@components/courses/courses.component').then(
        (m) => m.CoursesComponent,
      ),
  },
  {
    path: 'course/:id',
    canActivate: [CourseGuard],
    children: [
      {
        path: 'overview',
        loadComponent: () =>
          import(
            '@components/courses/course-overview/course-overview.component'
          ).then((m) => m.CourseOverviewComponent),
      },
      {
        path: 'chapter/:chapter',
        loadComponent: () =>
          import(
            '@components/courses/course-chapter/course-chapter.component'
          ).then((m) => m.CourseChapterComponent),
      },
      {
        path: 'chapter/:chapter/:topic',
        loadComponent: () =>
          import(
            '@components/courses/course-topic/course-topic.component'
          ).then((m) => m.CourseTopicComponent),
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
    children: [
      {
        path: 'basic-info',
        loadComponent: () =>
          import(
            '../dashboard/custom-day/basic-info/basic-info.component'
          ).then((m) => m.CustomDayBasicInfoComponent),
      },
      {
        path: 'diet-nutrition',
        loadComponent: () =>
          import(
            '../dashboard/custom-day/diet-nutrition/diet-nutrition.component'
          ).then((m) => m.CustomDayDietNutritionComponent),
      },
      {
        path: 'work-skills',
        loadComponent: () =>
          import(
            '../dashboard/custom-day/work-skills/work-skills.component'
          ).then((m) => m.CustomDayWorkSkillsComponent),
      },
      {
        path: 'lifestyle-health',
        loadComponent: () =>
          import(
            '../dashboard/custom-day/lifestyle-health/lifestyle-health.component'
          ).then((m) => m.CustomDayLifestyleHealthComponent),
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
    children: [
      {
        path: 'dailylook',
        loadComponent: () =>
          import('@components/daily-look/daily-look.component').then(
            (m) => m.DailyLookComponent,
          ),
        canActivate: [scheduleGuard],
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
