import { Routes } from '@angular/router';
import { loggedIn } from '../guards/auth.guard';

export const profileRoutes: Routes = [
  {
    path: 'profile',
    canActivate: [loggedIn],
    loadComponent: () =>
      import('../profile/profile.component').then((m) => m.ProfileComponent),
    children: [
      {
        path: 'details',
        loadComponent: () =>
          import('../profile/profile-details/profile-details.component').then(
            (m) => m.ProfileDetailsComponent,
          ),
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('../profile/notifications/notifications.component').then(
            (m) => m.NotificationsComponent,
          ),
      },
      {
        path: 'create-avatar',
        loadComponent: () =>
          import(
            '../registration/generate-avatar/generate-avatar.component'
          ).then((m) => m.GenerateAvatarComponent),
      },
      {
        path: 'edit',
        loadComponent: () =>
          import('../registration/registration.component').then(
            (m) => m.RegistrationComponent,
          ),
        children: [
          {
            path: 'basic-info',
            loadComponent: () =>
              import('../registration/basic-info/basic-info.component').then(
                (m) => m.BasicInfoComponent,
              ),
          },
          {
            path: 'work-skills',
            loadComponent: () =>
              import('../registration/work-skills/work-skills.component').then(
                (m) => m.WorkSkillsComponent,
              ),
          },
          {
            path: 'upload-resume',
            loadComponent: () =>
              import(
                '../registration/upload-resume/upload-resume.component'
              ).then((m) => m.UploadResumeComponent),
          },
          {
            path: 'lifestyle-health',
            loadComponent: () =>
              import(
                '../registration/lifestyle-health/lifestyle-health.component'
              ).then((m) => m.LifestyleHealthComponent),
          },
          {
            path: 'diet-nutrition',
            loadComponent: () =>
              import(
                '../registration/diet-nutrition/diet-nutrition.component'
              ).then((m) => m.DietNutritionComponent),
          },
          {
            path: 'financial-planning',
            loadComponent: () =>
              import(
                '../registration/financial-planning/financial-planning.component'
              ).then((m) => m.FinancialPlanningComponent),
          },
          {
            path: 'more-info',
            loadComponent: () =>
              import('../registration/more-info/more-info.component').then(
                (m) => m.MoreInfoComponent,
              ),
          },
          { path: '', redirectTo: 'basic-info', pathMatch: 'full' },
          { path: '**', redirectTo: 'basic-info' },
        ],
      },
      { path: '', redirectTo: 'details', pathMatch: 'full' },
    ],
  },
];
