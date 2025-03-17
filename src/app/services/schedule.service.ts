/* eslint-disable @typescript-eslint/no-unsafe-call */
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
  collection,
  collectionData,
  doc,
  Firestore,
  getDoc,
  query,
  setDoc,
  where,
} from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as ScheduleActions from '@store/schedule/schedule.actions'; // Import actions
import * as ScheduleSelectors from '@store/schedule/schedule.selectors'; // Select from schedule
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ScheduleService {
  constructor(
    private firestore: Firestore,
    private auth: Auth,
    private router: Router,
    private store: Store,
  ) {}

  getTodaySchedule(today: any): Observable<any> {
    if (!this.auth.currentUser) {
      this.router.navigate(['/signup']);
      throw new Error('User not authenticated');
    }

    const userRef = doc(this.firestore, 'users', this.auth.currentUser.uid);
    const schedulesCollectionRef = collection(userRef, 'schedules');

    // Query to find today's schedule
    const todayQuery = query(schedulesCollectionRef, where('id', '==', today));

    return collectionData(todayQuery, { idField: 'id' }) as Observable<any>;
  }

  loadTomorrowSchedule(): void {
    this.store
      .select(ScheduleSelectors.selectTomorrow)
      .pipe(
        take(1),
        switchMap((tomorrowSchedule) => {
          if (tomorrowSchedule) {
            // Tomorrow's schedule exists in the state
            return of(tomorrowSchedule);
          } else {
            // Fetch tomorrow's schedule from Firestore
            return this.getTomorrowScheduleFromDB();
          }
        }),
      )
      .subscribe({
        next: (scheduleData) => {
          if (scheduleData && scheduleData.schedule.length > 0) {
            // Dispatch action to store tomorrow's schedule in state
            this.store.dispatch(
              ScheduleActions.loadTomorrowSuccess({
                tomorrowData: scheduleData,
              }),
            );
          } else {
            // Navigate to custom day creation with query parameters
            this.router.navigate(['/dashboard/custom-day'], {
              queryParams: { forTomorrow: true },
            });
          }
        },
        error: (error) => {
          console.error('Error loading tomorrow’s schedule:', error);
          this.router.navigate(['/dashboard/custom-day']);
        },
      });
  }

  public getTomorrowScheduleFromDB(): Observable<any> {
    if (!this.auth.currentUser) {
      this.router.navigate(['/signup']);
      throw new Error('User not authenticated');
    }

    const userRef = doc(this.firestore, 'users', this.auth.currentUser.uid);
    const schedulesCollectionRef = collection(userRef, 'schedules');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowId = tomorrow.toLocaleDateString('en-CA');

    const tomorrowQuery = query(
      schedulesCollectionRef,
      where('id', '==', tomorrowId),
    );

    return collectionData(tomorrowQuery, { idField: 'id' }).pipe(
      take(1),
      map((schedules) => schedules[0] || null), // Return only the first item or null if none found
      catchError((error) => {
        console.error(
          'Error fetching tomorrow’s schedule from Firestore:',
          error,
        );
        return of(null); // Return null if there's an error fetching from DB
      }),
    ) as Observable<any>;
  }

  /**
   * Save recommendations to a specific time slot in the schedule object.
   * @param scheduleId The ID of the schedule document.
   * @param timeSlotIndex The index of the time slot inside the `schedule` array.
   * @param recommendations The list of recommendations to save.
   */
  async saveRecommendationsToTimeSlot(
    scheduleId: string,
    timeSlotIndex: number,
    recommendations: any[],
  ): Promise<void> {
    if (!this.auth.currentUser) {
      this.router.navigate(['/signup']);
      throw new Error('User not authenticated');
    }

    const userRef = doc(this.firestore, 'users', this.auth.currentUser.uid);
    const scheduleRef = doc(collection(userRef, 'schedules'), scheduleId);

    try {
      // Fetch the current schedule document
      const scheduleSnap = await getDoc(scheduleRef);
      if (!scheduleSnap.exists()) {
        throw new Error(`Schedule with ID ${scheduleId} does not exist.`);
      }

      const scheduleData = scheduleSnap.data() as any;

      // Ensure `schedule` and `schedule.schedule` exist
      if (!scheduleData.schedule || !Array.isArray(scheduleData.schedule)) {
        scheduleData.schedule = [];
      }

      // Update the specific time slot with recommendations
      scheduleData.schedule[timeSlotIndex] = {
        ...scheduleData.schedule[timeSlotIndex],
        recommendedItems: recommendations,
      };

      // Save the updated schedule document
      await setDoc(scheduleRef, scheduleData, { merge: true });
    } catch (error) {
      console.error(
        `Error saving recommendations for schedule: ${scheduleId}, time slot index: ${timeSlotIndex}`,
        error,
      );
      throw error;
    }
  }
}
