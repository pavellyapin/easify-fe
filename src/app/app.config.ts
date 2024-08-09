/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { environment } from '../environment/environment';
import { routes } from './app.routes';
import { chatReducer } from './store/chat/chat.reducer';
import { loadingReducer } from './store/loader/loading.reducer';
import { hydrationMetaReducer } from './store/meta-reducers/local-storage.reducer';
import { scheduleReducer } from './store/schedule/schedule.reducer';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideClientHydration(),
    provideAnimations(),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
    provideStore(
      { chat: chatReducer, dailyLook: scheduleReducer, loader: loadingReducer },
      { metaReducers: [hydrationMetaReducer] },
    ),
    provideEffects([]),
    provideStoreDevtools({ maxAge: 25 }),
  ],
};
