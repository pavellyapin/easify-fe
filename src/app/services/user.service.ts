/* eslint-disable @typescript-eslint/no-unnecessary-type-arguments */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/use-unknown-in-catch-callback-variable */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@angular/core';
import { Auth, User } from '@angular/fire/auth';
import {
  DocumentData,
  DocumentSnapshot,
  Firestore,
  addDoc,
  collection,
  collectionData,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
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

  isUserNew(uid: string): Observable<boolean> {
    const userDocRef = doc(this.firestore, 'users', uid);
    const userDocPromise: Promise<DocumentSnapshot<DocumentData>> =
      getDoc(userDocRef);
    return from(userDocPromise).pipe(
      map((docSnapshot) => !docSnapshot.exists()),
      catchError(() => of(false)),
    );
  }

  async saveUserToFirestore(user: User) {
    try {
      const userRef = doc(this.firestore, 'users', user.uid);
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      };
      await setDoc(userRef, userData);
      console.log('User data saved to Firestore');
    } catch (error: any) {
      console.error('Error saving user data to Firestore:', error);
      if (error.code) {
        console.error(`Error Code: ${error.code}`);
      }
      if (error.message) {
        console.error(`Error Message: ${error.message}`);
      }
      if (error.details) {
        console.error(`Error Details: ${error.details}`);
      }
    }
  }

  async saveQuestionToFirestore(
    questionId: number,
    question: string,
    answer: string | string[],
  ) {
    try {
      const userRef = doc(this.firestore, 'users', this.auth.currentUser?.uid!);
      const questionsCollectionRef = collection(userRef, 'questions');
      const q = query(questionsCollectionRef, where('id', '==', questionId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // If no existing document, create a new one
        const questionData = {
          id: questionId,
          question,
          answer,
          createdAt: new Date(),
        };
        await addDoc(questionsCollectionRef, questionData);
        console.log('Question data saved to Firestore');
      } else {
        // If document exists, update it
        const docRef = querySnapshot.docs[0]!.ref;
        await updateDoc(docRef, {
          answer,
          updatedAt: new Date(),
        });
        console.log('Question data updated in Firestore');
      }
    } catch (error: any) {
      console.error('Error saving question data to Firestore:', error);
      if (error.code) {
        console.error(`Error Code: ${error.code}`);
      }
      if (error.message) {
        console.error(`Error Message: ${error.message}`);
      }
      if (error.details) {
        console.error(`Error Details: ${error.details}`);
      }
    }
  }

  getAnswersObservable(): Observable<
    { questionId: number; question: string; answer: string | string[] }[]
  > {
    if (!this.auth.currentUser) {
      throw new Error('User not authenticated');
    }

    const userRef = doc(this.firestore, 'users', this.auth.currentUser.uid);
    const questionsCollectionRef = collection(userRef, 'questions');

    return collectionData(questionsCollectionRef, {
      idField: 'id',
    }) as Observable<
      { questionId: number; question: string; answer: string | string[] }[]
    >;
  }
}
