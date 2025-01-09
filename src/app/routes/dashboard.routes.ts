/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Routes } from '@angular/router';
import { ErrorComponent } from '@components/error/error.component';
import { CourseGuard } from 'app/guards/course.guard';
import { GrowthGuard } from 'app/guards/growth.guard';
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
  },
  {
    path: 'recipe-search-results',
    loadComponent: () =>
      import(
        '@dashboard/recipes/recipe-search-results/recipe-search-results.component'
      ).then((m) => m.RecipeSearchResultsComponent),
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
          },
          {
            path: ':stage/:point/easify',
            loadComponent: () =>
              import(
                '@dashboard/recipes/recipe-instructions/easify-instruction/easify-instruction.component'
              ).then((m) => m.EasifyInstructionComponent),
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
  },
  {
    path: 'shopping/:id',
    loadComponent: () =>
      import('@dashboard/recipes/shopping-list/shopping-list.component').then(
        (m) => m.ShoppingListComponent,
      ),
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
          },
          {
            path: ':stage/:point/easify',
            loadComponent: () =>
              import(
                '@dashboard/fitness/workout-routine/easify-workout-instruction/easify-workout-instruction.component'
              ).then((m) => m.EasifyWorkoutInstructionComponent),
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
      import('@dashboard/personal-growth/personal-growth.component').then(
        (m) => m.PersonalGrowthComponent,
      ),
    canActivate: [GrowthGuard],
  },
  {
    path: 'resume-upload',
    loadComponent: () =>
      import(
        '@dashboard/personal-growth/resume-upload/resume-upload.component'
      ).then((m) => m.ResumeUploadComponent),
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
      },
      {
        path: 'chapter/:chapter',
        loadComponent: () =>
          import(
            '@dashboard/courses/course-chapter/course-chapter.component'
          ).then((m) => m.CourseChapterComponent),
      },
      {
        path: 'chapter/:chapter/:topic',
        loadComponent: () =>
          import('@dashboard/courses/course-topic/course-topic.component').then(
            (m) => m.CourseTopicComponent,
          ),
        children: [
          {
            path: ':point',
            loadComponent: () =>
              import(
                '@dashboard/courses/course-topic/topic-content/topic-content.component'
              ).then((m) => m.TopicContentComponent),
          },
          {
            path: ':point/easify',
            loadComponent: () =>
              import(
                '@dashboard/courses/course-topic/easify-topic/easify-topic.component'
              ).then((m) => m.EasifyTopicComponent),
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
          import('../dashboard/daily-look/daily-look.component').then(
            (m) => m.DailyLookComponent,
          ),
        canActivate: [scheduleGuard],
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
