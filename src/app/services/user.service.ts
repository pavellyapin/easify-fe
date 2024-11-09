import { Injectable } from '@angular/core';
import { Auth, User } from '@angular/fire/auth';
import {
  DocumentData,
  DocumentReference,
  Firestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { Observable, catchError, from, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(
    private firestore: Firestore,
    private auth: Auth,
  ) {}

  // Get current user's UID or handle the case where the user is not authenticated
  private getUid(): string | null {
    const currentUser = this.auth.currentUser;
    return currentUser ? currentUser.uid : null;
  }

  // Check if the user is new by checking if the user document exists
  isUserNew(): Observable<boolean> {
    const userDocRef = this.getUserDocRef();
    const userDocPromise = getDoc(userDocRef!);
    return from(userDocPromise).pipe(
      map((docSnapshot) => !docSnapshot.exists()),
      catchError(() => of(false)),
    );
  }

  // Save the basic user information to Firestore (used when creating a new user)
  async saveUserToFirestore(user: User): Promise<void> {
    try {
      const userRef = this.getUserDocRef();
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      };
      await setDoc(userRef!, userData);
      console.log('User data saved to Firestore');
    } catch (error: any) {
      console.error('Error saving user data to Firestore:', error);
    }
  }

  // Get Firestore document reference for the current user
  public getUserDocRefAsObs(): Observable<DocumentReference<DocumentData> | null> {
    return of(this.getUserDocRef());
  }

  // Get Firestore document reference for the current user
  public getUserDocRef(): DocumentReference<DocumentData> | null {
    const uid = this.getUid();
    if (!uid) {
      console.error('User is not authenticated');
      return null;
    }
    return doc(this.firestore, 'users', uid);
  }

  // Function to fetch the entire user profile in one object
  getFullProfile(): Observable<any> {
    const userDocRef = this.getUserDocRef();
    if (!userDocRef) return of(null);

    return from(getDoc(userDocRef)).pipe(
      map((docSnapshot) => {
        if (!docSnapshot.exists()) {
          throw new Error('User profile not found');
        }

        // Return all parts of the profile in a single object
        const userData = docSnapshot.data();
        return {
          basicInfo: userData?.['basicInfo'] || {},
          dietNutrition: userData?.['dietNutrition'] || {},
          financialPlanning: userData?.['financialPlanning'] || {},
          lifestyleHealth: userData?.['lifestyleHealth'] || {},
          moreInfo: userData?.['moreInfo'] || {},
          resume: userData?.['resume'] || {},
          workSkills: userData?.['workSkills'] || {},
          displayName: userData?.['displayName'] || null,
          email: userData?.['email'] || null,
          avatarUrl: userData?.['avatarUrl'] || null,
        };
      }),
      catchError((error) => {
        console.error('Error fetching user profile:', error);
        return of(null);
      }),
    );
  }

  // Function to save avatar data to Firestore
  async saveAvatarData(avatarData: any): Promise<void> {
    try {
      const userRef = this.getUserDocRef();
      if (!userRef) {
        throw new Error('User not authenticated');
      }

      // Update user document with avatar data
      await updateDoc(userRef, {
        avatar: avatarData,
      });
      console.log('Avatar data saved to Firestore');
    } catch (error: any) {
      console.error('Error saving avatar data to Firestore:', error);
    }
  }
}
