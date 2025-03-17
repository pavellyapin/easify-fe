import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { EasifyService } from '@services/easify.service';
import { setDashboardLoading } from '@store/loader/loading.actions';
import * as ScheduleActions from '@store/schedule/schedule.actions'; // Import actions
import * as ScheduleSelectors from '@store/schedule/schedule.selectors';
import {
  catchError,
  firstValueFrom,
  from,
  map,
  mergeMap,
  of,
  switchMap,
  take,
} from 'rxjs';
import {
  loadTomorrowSuccess,
  refreshSchedule,
  refreshScheduleFailure,
} from './schedule.actions';

@Injectable()
export class ScheduleEffects {
  constructor(
    private actions$: Actions,
    private chatService: EasifyService,
    private router: Router,
    private store: Store<any>,
  ) {}

  refreshSchedule$ = createEffect(() =>
    this.actions$.pipe(
      ofType(refreshSchedule), // Listen for the refreshSchedule action
      switchMap((action) => {
        // Dispatch loading actions

        this.store.dispatch(setDashboardLoading({ isLoading: true }));
        if (action.request.forTomorrow) {
          this.store.dispatch(ScheduleActions.loadTomorrow());
        } else {
          this.store.dispatch(ScheduleActions.loadSchedule());
        }

        // Trigger the WebSocket request via EasifyService
        this.chatService.getDaily(action.request, 'getDaily');

        // Listen for WebSocket response actions
        return this.actions$.pipe(
          ofType(ScheduleActions.refreshScheduleSuccess, loadTomorrowSuccess), // Respond to success actions
          take(1), // Ensure we respond to the first success action only
          map(() => {
            this.router.navigate(['/dashboard']); // Navigate to the dashboard
            return setDashboardLoading({ isLoading: false }); // Pass the success action to the reducer
          }),
          catchError((error) => {
            console.error('Error handling schedule via WebSocket:', error);
            this.store.dispatch(setDashboardLoading({ isLoading: false }));
            return of(refreshScheduleFailure({ error }));
          }),
        );
      }),
    ),
  );

  updateCustomDay$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ScheduleActions.submitCustomDayRequestFromAPI), // Listen for the submitCustomDayRequest action
      mergeMap(() =>
        from(
          firstValueFrom(
            this.store.select(ScheduleSelectors.selectCustomDayRequest),
          ),
        ).pipe(
          mergeMap((customDayRequest) => {
            if (!customDayRequest) {
              console.log('No custom day request found to submit.');
              return of(
                refreshScheduleFailure({
                  error: 'No custom day request found',
                }),
              );
            }

            // Prepare the request object with defaults
            const request = {
              ...customDayRequest,
              type: customDayRequest.basicInfo?.type || 'full',
            };
            if (request.basicInfo.forTomorrow) {
              this.store.dispatch(ScheduleActions.loadTomorrow());
            } else {
              this.store.dispatch(ScheduleActions.loadSchedule());
            }

            this.chatService.getDaily(request, 'getCustomDay');

            return this.actions$.pipe(
              ofType(
                ScheduleActions.refreshScheduleSuccess,
                loadTomorrowSuccess,
              ), // Respond to success actions
              take(1), // Ensure we respond to the first success action only
              map(() => {
                this.router.navigate(['/dashboard']); // Navigate to the dashboard
                return setDashboardLoading({ isLoading: false }); // Pass the success action to the reducer
              }),
              catchError((error) => {
                console.error('Error handling schedule via WebSocket:', error);
                this.store.dispatch(setDashboardLoading({ isLoading: false }));
                return of(refreshScheduleFailure({ error }));
              }),
            );
          }),
        ),
      ),
    ),
  );
}
