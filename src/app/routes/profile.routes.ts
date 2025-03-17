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
        data: {
          title: 'Profile Details',
          description: 'View and update your personal profile details.',
        },
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('../profile/notifications/notifications.component').then(
            (m) => m.NotificationsComponent,
          ),
        data: {
          title: 'Notifications',
          description: 'Manage your notification settings and preferences.',
        },
      },
      {
        path: 'create-avatar',
        loadComponent: () =>
          import(
            '../registration/generate-avatar/generate-avatar.component'
          ).then((m) => m.GenerateAvatarComponent),
        data: {
          title: 'Create Avatar',
          description: 'Generate and customize your profile avatar.',
        },
      },
      {
        path: 'edit',
        loadComponent: () =>
          import('../registration/registration.component').then(
            (m) => m.RegistrationComponent,
          ),
        data: {
          title: 'Edit Profile',
          description: 'Update your profile details and personal information.',
        },
        children: [
          {
            path: 'basic-info',
            loadComponent: () =>
              import('../registration/basic-info/basic-info.component').then(
                (m) => m.BasicInfoComponent,
              ),
            data: {
              title: 'Basic Information',
              description: 'Provide your name, location, and other details.',
            },
          },
          {
            path: 'work-skills',
            loadComponent: () =>
              import('../registration/work-skills/work-skills.component').then(
                (m) => m.WorkSkillsComponent,
              ),
            data: {
              title: 'Work & Skills',
              description: 'Share your career, industries, and skills.',
            },
          },
          {
            path: 'upload-resume',
            loadComponent: () =>
              import(
                '../registration/upload-resume/upload-resume.component'
              ).then((m) => m.UploadResumeComponent),
            data: {
              title: 'Upload Resume',
              description: 'Upload your resume for job recommendations.',
            },
          },
          {
            path: 'lifestyle-health',
            loadComponent: () =>
              import(
                '../registration/lifestyle-health/lifestyle-health.component'
              ).then((m) => m.LifestyleHealthComponent),
            data: {
              title: 'Lifestyle & Health',
              description: 'Tell us about your fitness, wellness, and habits.',
            },
          },
          {
            path: 'diet-nutrition',
            loadComponent: () =>
              import(
                '../registration/diet-nutrition/diet-nutrition.component'
              ).then((m) => m.DietNutritionComponent),
            data: {
              title: 'Diet & Nutrition',
              description: 'Customize your dietary preferences and habits.',
            },
          },
          {
            path: 'financial-planning',
            loadComponent: () =>
              import(
                '../registration/financial-planning/financial-planning.component'
              ).then((m) => m.FinancialPlanningComponent),
            data: {
              title: 'Financial Planning',
              description:
                'Plan your financial goals and investment strategies.',
            },
          },
          {
            path: 'more-info',
            loadComponent: () =>
              import('../registration/more-info/more-info.component').then(
                (m) => m.MoreInfoComponent,
              ),
            data: {
              title: 'Additional Information',
              description: 'Share any other details that define your journey.',
            },
          },
          { path: '', redirectTo: 'basic-info', pathMatch: 'full' },
          { path: '**', redirectTo: 'basic-info' },
        ],
      },
      {
        path: 'register',
        loadComponent: () =>
          import('../registration/registration.component').then(
            (m) => m.RegistrationComponent,
          ),
        data: {
          title: 'Edit Profile',
          description: 'Update your profile details and personal information.',
        },
        children: [
          {
            path: 'basic-info',
            loadComponent: () =>
              import('../registration/basic-info/basic-info.component').then(
                (m) => m.BasicInfoComponent,
              ),
            data: {
              title: 'Basic Information',
              description: 'Provide your name, location, and other details.',
            },
          },
          {
            path: 'work-skills',
            loadComponent: () =>
              import('../registration/work-skills/work-skills.component').then(
                (m) => m.WorkSkillsComponent,
              ),
            data: {
              title: 'Work & Skills',
              description: 'Share your career, industries, and skills.',
            },
          },
          {
            path: 'upload-resume',
            loadComponent: () =>
              import(
                '../registration/upload-resume/upload-resume.component'
              ).then((m) => m.UploadResumeComponent),
            data: {
              title: 'Upload Resume',
              description: 'Upload your resume for job recommendations.',
            },
          },
          {
            path: 'lifestyle-health',
            loadComponent: () =>
              import(
                '../registration/lifestyle-health/lifestyle-health.component'
              ).then((m) => m.LifestyleHealthComponent),
            data: {
              title: 'Lifestyle & Health',
              description: 'Tell us about your fitness, wellness, and habits.',
            },
          },
          {
            path: 'diet-nutrition',
            loadComponent: () =>
              import(
                '../registration/diet-nutrition/diet-nutrition.component'
              ).then((m) => m.DietNutritionComponent),
            data: {
              title: 'Diet & Nutrition',
              description: 'Customize your dietary preferences and habits.',
            },
          },
          {
            path: 'financial-planning',
            loadComponent: () =>
              import(
                '../registration/financial-planning/financial-planning.component'
              ).then((m) => m.FinancialPlanningComponent),
            data: {
              title: 'Financial Planning',
              description:
                'Plan your financial goals and investment strategies.',
            },
          },
          {
            path: 'more-info',
            loadComponent: () =>
              import('../registration/more-info/more-info.component').then(
                (m) => m.MoreInfoComponent,
              ),
            data: {
              title: 'Additional Information',
              description: 'Share any other details that define your journey.',
            },
          },
          { path: '', redirectTo: 'basic-info', pathMatch: 'full' },
          { path: '**', redirectTo: 'basic-info' },
        ],
      },
      { path: '', redirectTo: 'details', pathMatch: 'full' },
    ],
  },
];
