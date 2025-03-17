/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { DatePipe } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { APP_INITIALIZER, ApplicationConfig } from '@angular/core';
import { getAnalytics, provideAnalytics } from '@angular/fire/analytics';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getFunctions, provideFunctions } from '@angular/fire/functions';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { TitleService } from '@services/title.service';
import { courseReducer } from '@store/course/course.reducer';
import { financeReducer } from '@store/finance/finance.reducer';
import { fitnessReducer } from '@store/fitness/fitness.reducer';
import { startedCourseReducer } from '@store/started-course/started-course.reducer';
import { startedGrowthReducer } from '@store/started-growth/started-growth.reducer';
import { startedPortfolioReducer } from '@store/started-portfolio/started-portfolio.reducer';
import { startedRecipeReducer } from '@store/started-recipe/started-recipe.reducer';
import { startedWorkoutReducer } from '@store/started-workout/started-workout.reducer';
import { environment } from '../environment/environment';
import { routes } from './app.routes';
import { IconService } from './services/icon.service';
import { chatReducer } from './store/chat/chat.reducer';
import { growthReducer } from './store/growth/growth.reducer';
import { loadingReducer } from './store/loader/loading.reducer';
import { hydrationMetaReducer } from './store/meta-reducers/local-storage.reducer';
import { recipeReducer } from './store/recipe/recipe.reducer';
import { ScheduleEffects } from './store/schedule/schedule.effects';
import { scheduleReducer } from './store/schedule/schedule.reducer';
import { UserEffects } from './store/user/user.effects';
import { userReducer } from './store/user/user.reducer';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled',
      }),
    ),
    provideHttpClient(),
    provideClientHydration(),
    provideAnimations(),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideFirestore(() => getFirestore()),
    provideFunctions(() => getFunctions()),
    provideStorage(() => getStorage()),
    provideAuth(() => getAuth()),
    provideAnalytics(() => getAnalytics()),
    provideStore(
      {
        chat: chatReducer,
        dailyLook: scheduleReducer,
        loader: loadingReducer,
        recipe: recipeReducer,
        user: userReducer,
        growth: growthReducer,
        course: courseReducer,
        fitness: fitnessReducer,
        finance: financeReducer,
        startedCourse: startedCourseReducer,
        startedWorkout: startedWorkoutReducer,
        startedRecipe: startedRecipeReducer,
        startedGrowth: startedGrowthReducer,
        startedPortfolio: startedPortfolioReducer,
      },
      { metaReducers: [hydrationMetaReducer] },
    ),
    provideEffects([UserEffects, ScheduleEffects]),
    {
      provide: APP_INITIALIZER,
      useFactory: (iconService: IconService) => () => {
        iconService.loadIcons();
      },
      deps: [IconService],
      multi: true,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: (titleService: TitleService) => () => {
        titleService.init();
      },
      deps: [TitleService],
      multi: true,
    },
    DatePipe,
  ],
};
