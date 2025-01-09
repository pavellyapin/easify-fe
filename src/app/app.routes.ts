import { Routes } from '@angular/router';
import { ErrorComponent } from '@components/error/error.component';
import { guestUser } from './guards/auth.guard';
import { dashboardRoutes } from './routes/dashboard.routes';
import { profileRoutes } from './routes/profile.routes';

export const routes: Routes = [
  {
    path: 'main',
    loadComponent: () =>
      import('./main/main.component').then((m) => m.MainComponent),
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('./pages/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'login',
        loadComponent: () =>
          import('./pages/login/login.component').then((m) => m.LoginComponent),
        canActivate: [guestUser],
      },
      {
        path: 'signup',
        loadComponent: () =>
          import('./pages/register/register.component').then(
            (m) => m.RegisterComponent,
          ),
        canActivate: [guestUser],
      },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: '**', redirectTo: 'home' }, // Fallback route for all other paths
    ],
  },
  ...dashboardRoutes,
  ...profileRoutes,
  { path: 'error', component: ErrorComponent },
  { path: '', redirectTo: 'main/home', pathMatch: 'full' },
  { path: '**', redirectTo: 'main/home' },
];
