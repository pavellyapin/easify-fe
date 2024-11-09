import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { EasifyService } from '@services/easify.service';
import { ScheduleService } from '@services/schedule.service'; // Import ScheduleService to fetch the updated schedule
import { setLoading } from '@store/loader/loading.actions';
import { catchError, map, of, switchMap } from 'rxjs';
import {
  refreshSchedule,
  refreshScheduleFailure,
  refreshScheduleSuccess,
  submitCustomDayRequest,
} from './schedule.actions';

@Injectable()
export class ScheduleEffects {
  constructor(
    private actions$: Actions,
    private chatService: EasifyService,
    private scheduleService: ScheduleService,
    private store: Store,
  ) {}

  refreshSchedule$ = createEffect(() =>
    this.actions$.pipe(
      ofType(refreshSchedule), // Listening for refreshSchedule action
      switchMap(() => {
        // Call getDaily to trigger schedule generation
        return this.chatService.getDaily().pipe(
          // Once getDaily succeeds, fetch the updated schedule from the database
          switchMap(() => {
            const today = new Date().toLocaleDateString('en-CA');
            return this.scheduleService.getTodaySchedule(today).pipe(
              map((schedules) => {
                if (schedules.length > 0) {
                  // On success, dispatch refreshScheduleSuccess and stop loading
                  return refreshScheduleSuccess({ scheduleData: schedules[0] });
                } else {
                  // If no schedule is found, dispatch a failure action
                  return refreshScheduleFailure({ error: 'No schedule found' });
                }
              }),
              catchError((error) => {
                console.error('Error fetching schedule from DB:', error);
                // On failure, dispatch refreshScheduleFailure and stop loading
                return of(refreshScheduleFailure({ error }));
              }),
            );
          }),
          catchError((error) => {
            console.error('Error refreshing schedule:', error);
            // On failure, dispatch refreshScheduleFailure and stop loading
            return of(refreshScheduleFailure({ error }));
          }),
        );
      }),
    ),
  );

  // Effect to handle custom day update and refresh the schedule
  updateCustomDay$ = createEffect(() =>
    this.actions$.pipe(
      ofType(submitCustomDayRequest), // Listening for the updateCustomDay action
      switchMap((action) => {
        //this.store.dispatch(setLoading(true));
        const request = action.customDayRequest;
        // Call getCustomDay to generate the custom day schedule
        return this.chatService.getCustomDay(request).pipe(
          // On success, trigger a refresh of the schedule
          switchMap(() => {
            const today = new Date().toLocaleDateString('en-CA');
            return this.scheduleService.getTodaySchedule(today).pipe(
              map((schedules) => {
                if (schedules.length > 0) {
                  // Dispatch success with the retrieved schedule
                  this.store.dispatch(setLoading(false));
                  return refreshScheduleSuccess({ scheduleData: schedules[0] });
                } else {
                  // Handle case where no schedule is found
                  return refreshScheduleFailure({ error: 'No schedule found' });
                }
              }),
              catchError((error) => {
                console.error('Error fetching schedule from DB:', error);
                // Dispatch failure if an error occurs when fetching the schedule
                return of(refreshScheduleFailure({ error }));
              }),
            );
          }),
          catchError((error) => {
            console.error('Error generating custom day:', error);
            // Dispatch failure if an error occurs when generating the custom day
            return of(refreshScheduleFailure({ error }));
          }),
        );
      }),
    ),
  );
}
