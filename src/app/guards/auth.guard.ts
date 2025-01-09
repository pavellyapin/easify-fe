/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { inject } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { setLoginLoading } from '@store/loader/loading.actions';
import { setProfileInfo } from '@store/user/user.action';
import { selectIsProfileLoading } from '@store/user/user.selector';
import { of } from 'rxjs';
import { filter, map, switchMap, take } from 'rxjs/operators';

export const loggedIn: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);
  const store = inject(Store);

  return authState(auth).pipe(
    take(1),
    switchMap((user) => {
      store.dispatch(setLoginLoading(true));
      if (user) {
        store.dispatch(setProfileInfo()); // Dispatch the action to set the profile

        // Now wait for the profile to be fully loaded
        return store.select(selectIsProfileLoading).pipe(
          filter((isLoading) => !isLoading),
          take(1),
          map((isLoading) => {
            store.dispatch(setLoginLoading(false));
            if (!isLoading) {
              return true; // Allow navigation
            } else {
              // Handle the case where the profile load fails
              router.navigate(['/login']);
              return false;
            }
          }),
        );
      } else {
        store.dispatch(setLoginLoading(false));
        router.navigate(['/login']);
        return of(false); // User not logged in, deny navigation
      }
    }),
  );
};

export const guestUser: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  return authState(auth).pipe(
    take(1),
    map((user) => {
      if (!user) {
        return true;
      } else {
        router.navigate(['/dashboard']);
        return false;
      }
    }),
  );
};
