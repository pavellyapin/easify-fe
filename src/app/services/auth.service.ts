/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  User,
  UserCredential,
  authState,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from '@angular/fire/auth';
import { Store } from '@ngrx/store';
import { Observable, from, map, tap } from 'rxjs';
import { clearMessages } from '../store/chat/chat.actions';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private auth: Auth,
    private store: Store,
  ) {}

  login(email: string, password: string): Observable<User | null> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      map((userCredential: UserCredential) => userCredential.user),
    );
  }

  registerWithEmail(email: string, password: string): Observable<User | null> {
    return from(
      createUserWithEmailAndPassword(this.auth, email, password),
    ).pipe(map((userCredential: UserCredential) => userCredential.user));
  }

  registerWithGoogle(): Observable<User | null> {
    return from(signInWithPopup(this.auth, new GoogleAuthProvider())).pipe(
      map((userCredential: UserCredential) => userCredential.user),
    );
  }

  logout(): Observable<void> {
    return from(signOut(this.auth)).pipe(
      tap(() => {
        this.store.dispatch(clearMessages());
      }),
    );
  }

  getCurrentUser(): Observable<User | null> {
    return authState(this.auth);
  }
}
