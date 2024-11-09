/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/use-unknown-in-catch-callback-variable */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import {
  addDoc,
  collection,
  collectionData,
  doc,
  DocumentData,
  Firestore,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { from, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FitnessWorkoutsService {
  constructor(
    private firestore: Firestore,
    private functions: Functions,
    private auth: Auth,
  ) {}

  getAllWorkouts(): Observable<any> {
    const workoutsCollectionRef = collection(this.firestore, 'workouts');
    return collectionData(workoutsCollectionRef, {
      idField: 'id',
    }).pipe(
      map((workouts: DocumentData[]) =>
        workouts.map((workout) => ({
          id: workout['id'],
          name: workout['name'],
          level: workout['difficulty'],
          overview: workout['description'],
          tags: workout['tags'],
        })),
      ),
    ) as Observable<any>;
  }

  async getWorkoutById(id: string): Promise<any> {
    const workoutDocRef = doc(this.firestore, `workouts/${id}`);
    const workoutDoc = await getDoc(workoutDocRef);
    if (workoutDoc.exists()) {
      return workoutDoc.data();
    } else {
      throw new Error(`Workout with ID ${id} not found`);
    }
  }

  recommendWorkouts(workoutTags: string[], count: any): Observable<any> {
    const recommendWorkoutsFunction = httpsCallable(
      this.functions,
      'recommendWorkouts',
    );
    const resultPromise = recommendWorkoutsFunction({ workoutTags, count });
    return from(resultPromise); // Convert the Promise to an Observable
  }

  async addWorkoutStart(workout: any) {
    try {
      const userRef = doc(this.firestore, 'users', this.auth.currentUser?.uid!);
      const userWorkoutsCollectionRef = collection(userRef, 'workouts');
      const q = query(
        userWorkoutsCollectionRef,
        where('workout.id', '==', workout.id),
      );
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        // If no existing document, create a new one
        const userWorkoutData = {
          workout,
          status: 'started',
          createdAt: new Date(),
        };
        await addDoc(userWorkoutsCollectionRef, userWorkoutData);
        console.log('User Workout data saved to Firestore');
      } else {
        // If document exists, update it
        const docRef = querySnapshot.docs[0]!.ref;
        await updateDoc(docRef, {
          updatedAt: new Date(),
        });
        console.log('User Workout data updated in Firestore');
      }
    } catch (error: any) {
      console.error('Error saving User Workout data to Firestore:', error);
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

  getStartedWorkouts(): Observable<any[]> {
    const userRef = doc(this.firestore, 'users', this.auth.currentUser?.uid!);
    const userWorkoutsCollectionRef = collection(userRef, 'workouts');

    // Query to find workouts with status 'started'
    const startedWorkoutsQuery = query(
      userWorkoutsCollectionRef,
      where('status', '==', 'started'),
    );

    return collectionData(startedWorkoutsQuery, {
      idField: 'id',
    }) as Observable<any[]>;
  }

  getAllWorkoutTags(): Observable<string[]> {
    const tagCountsRef = doc(this.firestore, 'tagCounts/workoutTags');

    return from(getDoc(tagCountsRef)).pipe(
      map((docSnapshot) => {
        const tagData = docSnapshot.data() || { tags: [] };

        // Extract the tag names from the array of objects
        return tagData['tags'].map(
          (tagObj: { tag: string; count: number }) => tagObj.tag,
        );
      }),
    );
  }

  getAllWorkoutCategories(): Observable<string[]> {
    const categoryCountsRef = doc(this.firestore, 'tagCounts/workoutCategory');

    return from(getDoc(categoryCountsRef)).pipe(
      map((docSnapshot) => {
        const categoryData = docSnapshot.data() || { categories: [] };

        // Extract the category names from the array of objects
        return categoryData['categories'].map(
          (categoryObj: { category: string; count: number }) =>
            categoryObj.category,
        );
      }),
    );
  }
}
