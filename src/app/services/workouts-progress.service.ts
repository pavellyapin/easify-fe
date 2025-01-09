/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
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
  Firestore,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WorkoutsProgressService {
  constructor(
    private firestore: Firestore,
    private auth: Auth,
  ) {}

  async addWorkoutStart(workout: any, progress?: any) {
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
          progress: progress ? progress : null,
          status: 'started',
          createdAt: new Date(),
        };
        await addDoc(userWorkoutsCollectionRef, userWorkoutData);
      } else {
        // If document exists, update it
        const docRef = querySnapshot.docs[0]!.ref;
        await updateDoc(docRef, {
          updatedAt: new Date(),
        });
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

  async getStartedWorkoutById(workoutId: string): Promise<any | null> {
    try {
      const userRef = doc(this.firestore, 'users', this.auth.currentUser?.uid!);
      const userWorkoutsCollectionRef = collection(userRef, 'workouts');

      // Query to find the workout by its ID and status 'started'
      const workoutQuery = query(
        userWorkoutsCollectionRef,
        where('workout.id', '==', workoutId),
        limit(1),
      );

      const workoutSnapshot = await getDocs(workoutQuery);
      if (!workoutSnapshot.empty) {
        const startedWorkout = workoutSnapshot.docs[0]?.data();
        return startedWorkout;
      } else {
        console.log(`No started workout found with ID: ${workoutId}`);
        return null;
      }
    } catch (error: any) {
      console.error('Error fetching started workout by ID:', error);
      if (error.code) {
        console.error(`Error Code: ${error.code}`);
      }
      if (error.message) {
        console.error(`Error Message: ${error.message}`);
      }
      if (error.details) {
        console.error(`Error Details: ${error.details}`);
      }
      return null;
    }
  }

  async getLatestStartedWorkout() {
    try {
      const userRef = doc(this.firestore, 'users', this.auth.currentUser?.uid!);
      const userWorkoutsCollectionRef = collection(userRef, 'workouts');

      // Query to get the latest started workout (based on createdAt)
      const latestWorkoutQuery = query(
        userWorkoutsCollectionRef,
        where('status', '==', 'started'),
        orderBy('createdAt', 'desc'),
        limit(1),
      );

      const latestWorkoutSnapshot = await getDocs(latestWorkoutQuery);
      if (!latestWorkoutSnapshot.empty) {
        const latestWorkout = latestWorkoutSnapshot.docs[0]?.data();
        return latestWorkout;
      } else {
        console.log('No started workouts found.');
        return null;
      }
    } catch (error: any) {
      console.error('Error getting latest started workout', error);
      if (error.code) {
        console.error(`Error Code: ${error.code}`);
      }
      if (error.message) {
        console.error(`Error Message: ${error.message}`);
      }
      if (error.details) {
        console.error(`Error Details: ${error.details}`);
      }
      return null;
    }
  }

  async updateWorkoutProgress(
    workoutId: string,
    progress: {
      progress: number;
      warmUpComplete: boolean;
      completedExercises: number;
      totalExercises: number;
    },
  ): Promise<void> {
    try {
      const userRef = doc(this.firestore, 'users', this.auth.currentUser?.uid!);
      const userWorkoutsCollectionRef = collection(userRef, 'workouts');

      // Query to find the workout by its ID
      const workoutQuery = query(
        userWorkoutsCollectionRef,
        where('workout.id', '==', workoutId),
        limit(1),
      );

      const workoutSnapshot = await getDocs(workoutQuery);
      if (!workoutSnapshot.empty) {
        const docRef = workoutSnapshot.docs[0]!.ref;

        // Update the progress field in the document
        await updateDoc(docRef, {
          progress: {
            progress: progress.progress,
            warmUpComplete: progress.warmUpComplete,
            completedExercises: progress.completedExercises,
            totalExercises: progress.totalExercises,
          },
          updatedAt: new Date(),
        });
      } else {
        console.log(`No started workout found with ID: ${workoutId}`);
      }
    } catch (error: any) {
      console.error('Error updating workout progress:', error);
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

  async getEasifyResponsesByItemId(itemId: string): Promise<any[]> {
    try {
      // Reference to the user's document
      const userRef = doc(this.firestore, 'users', this.auth.currentUser?.uid!);
      // Reference to the 'easifyResponses' sub-collection
      const easifyResponsesCollectionRef = collection(
        userRef,
        'easifyResponses',
      );

      // Query to fetch all documents with the specified itemId
      const responsesQuery = query(
        easifyResponsesCollectionRef,
        where('itemId', '==', itemId),
        orderBy('timestamp', 'desc'), // Order responses by timestamp (latest first)
      );

      const querySnapshot = await getDocs(responsesQuery);

      if (!querySnapshot.empty) {
        // Map the documents to an array of data
        const responses = querySnapshot.docs.map((doc) => ({
          id: doc.id, // Include document ID for reference
          ...doc.data(),
        }));
        console.log(
          `Fetched ${responses.length} responses for itemId: ${itemId}`,
        );
        return responses;
      } else {
        console.log(`No Easify responses found for itemId: ${itemId}`);
        return [];
      }
    } catch (error: any) {
      console.error('Error fetching Easify responses:', error);
      if (error.code) {
        console.error(`Error Code: ${error.code}`);
      }
      if (error.message) {
        console.error(`Error Message: ${error.message}`);
      }
      if (error.details) {
        console.error(`Error Details: ${error.details}`);
      }
      return [];
    }
  }
}
