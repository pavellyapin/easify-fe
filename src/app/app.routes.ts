/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Routes } from '@angular/router';
import { CourseDetailsComponent } from './components/courses/course-details/course-details.component';
import { CoursesComponent } from './components/courses/courses.component';
import { DailyLookComponent } from './components/daily-look/daily-look.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { QUESTIONS } from './components/registration/question-config';
import { RegistrationComponent } from './components/registration/registration.component';
import { guestUser, loggedIn } from './guards/auth.guard';
import { scheduleGuard } from './guards/schedule.guard';

// Generate registration routes dynamically from QUESTIONS array
const registrationRoutes = QUESTIONS.map((_question, index) => ({
  path: `s${index + 2}`,
  component: RegistrationComponent,
  data: { step: index + 2 },
  canActivate: [loggedIn],
}));

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent, canActivate: [guestUser] },
  {
    path: 'registration',
    children: [
      {
        path: 's1',
        component: RegistrationComponent,
        data: { step: 1 },
        canActivate: [guestUser],
      },
      ...registrationRoutes,
      { path: '', redirectTo: 's1', pathMatch: 'full' },
      { path: '**', redirectTo: 's1' },
    ],
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [loggedIn],
    children: [
      {
        path: 'dailylook',
        component: DailyLookComponent,
        canActivate: [scheduleGuard],
      },
      {
        path: 'course/:id',
        component: CourseDetailsComponent,
      },
      {
        path: 'courses',
        component: CoursesComponent,
      },

      { path: '**', redirectTo: 'dailylook' }, // Fallback route
    ],
  },
  { path: '**', redirectTo: 'login' }, // Fallback route
];
