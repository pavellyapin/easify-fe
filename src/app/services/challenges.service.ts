/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import {
  Firestore,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class ChallengeService {
  constructor(
    private firestore: Firestore,
    private auth: Auth,
  ) {}

  // Method to get the first incomplete challenge by type
  async getFirstIncompleteChallengeByType(type: string): Promise<any> {
    try {
      const userId = this.auth.currentUser?.uid;

      if (!userId) {
        throw new Error('User not authenticated');
      }

      const challengesRef = collection(
        this.firestore,
        `users/${userId}/challenges`,
      );

      // Query to get the first incomplete challenge of the specified type
      const incompleteChallengeQuery = query(
        challengesRef,
        where('type', '==', type),
        where('progress', '<', 100), // Incomplete challenge has progress less than 100
        orderBy('level'), // Assuming the challenges have a 'level' field to sort
        limit(1), // Only get the first result
      );

      const querySnapshot = await getDocs(incompleteChallengeQuery);

      if (!querySnapshot.empty) {
        const firstChallenge = querySnapshot.docs[0]?.data();
        return firstChallenge;
      } else {
        console.log('No incomplete challenges found for type:', type);
        return null;
      }
    } catch (error: any) {
      console.error('Error getting first incomplete challenge by type', error);
      return null;
    }
  }
}
