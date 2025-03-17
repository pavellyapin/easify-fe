/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import {
  Auth,
  FacebookAuthProvider,
  GoogleAuthProvider,
  TwitterAuthProvider,
  User,
  UserCredential,
  authState,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from '@angular/fire/auth';
import { Store } from '@ngrx/store';
import { clearMessages } from '@store/chat/chat.actions';
import { setLoginLoading } from '@store/loader/loading.actions';
import { clearSchedule } from '@store/schedule/schedule.actions';
import { clearStartedCourse } from '@store/started-course/started-course.actions';
import { clearStartedGrowth } from '@store/started-growth/started-growth.actions';
import { clearUser } from '@store/user/user.action';
import { Observable, from, map, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private auth: Auth,
    private store: Store,
  ) {}

  toggleLoader(isLoading: boolean) {
    this.store.dispatch(setLoginLoading({ isLoading: isLoading }));
  }

  login(email: string, password: string): Observable<User | null> {
    this.toggleLoader(true);
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      map((userCredential: UserCredential) => userCredential.user),
    );
  }

  registerWithEmail(email: string, password: string): Observable<User | null> {
    this.toggleLoader(true);
    return from(
      createUserWithEmailAndPassword(this.auth, email, password),
    ).pipe(map((userCredential: UserCredential) => userCredential.user));
  }

  registerWithGoogle(): Observable<User | null> {
    this.toggleLoader(true);
    return from(signInWithPopup(this.auth, new GoogleAuthProvider())).pipe(
      map((userCredential: UserCredential) => userCredential.user),
    );
  }

  registerWithFacebook(): Observable<User | null> {
    this.toggleLoader(true);
    return from(signInWithPopup(this.auth, new FacebookAuthProvider())).pipe(
      map((userCredential: UserCredential) => userCredential.user),
    );
  }

  registerWithX(): Observable<User | null> {
    this.toggleLoader(true);
    return from(signInWithPopup(this.auth, new TwitterAuthProvider())).pipe(
      map((userCredential: UserCredential) => userCredential.user),
    );
  }

  logout(): Observable<void> {
    return from(signOut(this.auth)).pipe(
      tap(() => {
        this.store.dispatch(clearMessages());
        this.store.dispatch(clearSchedule());
        this.store.dispatch(clearStartedCourse());
        this.store.dispatch(clearStartedGrowth());
        this.store.dispatch(clearUser());
      }),
    );
  }

  getCurrentUser(): Observable<User | null> {
    return authState(this.auth);
  }
}
