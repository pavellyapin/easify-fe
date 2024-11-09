import { Routes } from '@angular/router';
import { guestUser } from './guards/auth.guard';
import { dashboardRoutes } from './routes/dashboard.routes';
import { profileRoutes } from './routes/profile.routes';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component').then(
        (m) => m.LoginComponent,
      ),
    canActivate: [guestUser],
  },
  ...profileRoutes,
  {
    path: 'signup',
    loadComponent: () =>
      import('./registration/register/register.component').then(
        (m) => m.RegisterComponent,
      ),
    canActivate: [guestUser],
  },
  ...dashboardRoutes,
  { path: '**', redirectTo: 'login' }, // Fallback route for all other paths
];
