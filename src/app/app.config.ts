/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { provideHttpClient } from '@angular/common/http';
import { APP_INITIALIZER, ApplicationConfig } from '@angular/core';
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
import { startedCourseReducer } from '@store/started-course/started-course.reducer';
import { startedGrowthReducer } from '@store/started-growth/started-growth.reducer';
import { startedRecipeReducer } from '@store/started-recipe/started-recipe.reducer';
import { startedWorkoutReducer } from '@store/started-workout/started-workout.reducer';
import { environment } from '../environment/environment';
import { routes } from './app.routes';
import { IconService } from './services/icon.service';
import { chatReducer } from './store/chat/chat.reducer';
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
    provideStore(
      {
        chat: chatReducer,
        dailyLook: scheduleReducer,
        loader: loadingReducer,
        recipe: recipeReducer,
        user: userReducer,
        startedCourse: startedCourseReducer,
        startedWorkout: startedWorkoutReducer,
        startedRecipe: startedRecipeReducer,
        startedGrowth: startedGrowthReducer,
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
  ],
};
