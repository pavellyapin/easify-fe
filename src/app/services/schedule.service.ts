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
  Firestore,
  addDoc,
  collection,
  collectionData,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ScheduleService {
  constructor(
    private firestore: Firestore,
    private auth: Auth,
    private router: Router,
  ) {}

  getTodaySchedule(): Observable<any> {
    if (!this.auth.currentUser) {
      this.router.navigate(['/registration']);
      throw new Error('User not authenticated');
    }

    const userRef = doc(this.firestore, 'users', this.auth.currentUser.uid);
    const schedulesCollectionRef = collection(userRef, 'schedules');
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    // Query to find today's schedule
    const todayQuery = query(schedulesCollectionRef, where('id', '==', today));

    return collectionData(todayQuery, { idField: 'id' }) as Observable<any>;
  }

  async saveScheduleToFirestore(schedule: any) {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const userRef = doc(this.firestore, 'users', this.auth.currentUser?.uid!);
      const schedulesCollectionRef = collection(userRef, 'schedules');
      const q = query(schedulesCollectionRef, where('id', '==', today));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // If no existing document, create a new one
        const scheduleData = {
          id: today,
          schedule,
          createdAt: new Date(),
        };
        await addDoc(schedulesCollectionRef, scheduleData);
        console.log('Schedule data saved to Firestore');
      } else {
        // If document exists, update it
        const docRef = querySnapshot.docs[0]!.ref;
        await updateDoc(docRef, {
          schedule,
          updatedAt: new Date(),
        });
        console.log('Schedule data updated in Firestore');
      }
    } catch (error: any) {
      console.error('Error saving Schedule data to Firestore:', error);
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
}
