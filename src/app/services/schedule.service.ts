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
  query,
  where,
} from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as ScheduleActions from '@store/schedule/schedule.actions'; // Import actions
import * as ScheduleSelectors from '@store/schedule/schedule.selectors'; // Select from schedule
import { firstValueFrom, Observable, of } from 'rxjs';
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
            // Navigate to custom day creation if no schedule found
            this.router.navigate(['/dashboard/custom-day']);
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

  // Function to retrieve and submit the custom day request
  async submitCustomDayRequest(
    type: 'basic' | 'full' | 'expanded' = 'full',
  ): Promise<void> {
    const customDayRequest = await firstValueFrom(
      this.store.select(ScheduleSelectors.selectCustomDayRequest),
    );

    if (customDayRequest) {
      const request = {
        ...customDayRequest,
        type,
      };

      this.store.dispatch(
        ScheduleActions.submitCustomDayRequest({
          customDayRequest: request,
        }),
      );

      console.log('Submitted custom day request:', request);
    } else {
      console.log('No custom day request found to submit.');
    }
  }
}
