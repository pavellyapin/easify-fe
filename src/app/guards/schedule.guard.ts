import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ofType } from '@ngrx/effects';
import { ActionsSubject, Store } from '@ngrx/store';
import { EasifyService } from '@services/easify.service';
import { ScheduleService } from '@services/schedule.service';
import { setGlobalLoading } from '@store/loader/loading.actions';
import {
  clearTomorrow,
  loadScheduleFailure,
  loadScheduleSuccess,
} from '@store/schedule/schedule.actions';
import { ScheduleState } from '@store/schedule/schedule.reducer';
import {
  selectSchedule,
  selectTomorrow,
} from '@store/schedule/schedule.selectors';
import { catchError, mergeMap, of, switchMap, take } from 'rxjs';

export const scheduleGuard: CanActivateFn = () => {
  const router = inject(Router);
  const store = inject(Store<ScheduleState>);
  const scheduleService = inject(ScheduleService);
  const chatService = inject(EasifyService);
  const actions$ = inject(ActionsSubject);

  return store.select(selectSchedule).pipe(
    take(1),
    mergeMap((todaySchedule) =>
      store.select(selectTomorrow).pipe(
        take(1),
        switchMap((tomorrowSchedule) => {
          store.dispatch(setGlobalLoading(true));
          const today = new Date().toLocaleDateString('en-CA');

          // If tomorrow's schedule exists and has today's date, clear it
          if (tomorrowSchedule?.id === today) {
            store.dispatch(clearTomorrow());
          }

          // Proceed with the usual logic for loading today's schedule
          if (todaySchedule && todaySchedule?.id === today) {
            store.dispatch(setGlobalLoading(false));
            return of(true);
          } else {
            return scheduleService.getTodaySchedule(today).pipe(
              switchMap((schedules) => {
                if (schedules.length > 0) {
                  const scheduleData = schedules[0];
                  store.dispatch(loadScheduleSuccess({ scheduleData }));
                  store.dispatch(setGlobalLoading(false));
                  return of(true);
                } else {
                  const now = new Date();
                  const hours = now.getHours();

                  const type = hours >= 12 ? 'secondHalf' : 'firstHalf';
                  const dailyRequest = { type: type };

                  chatService.getDaily(dailyRequest, 'getDaily'); // Initiate WebSocket request

                  return actions$.pipe(
                    ofType(loadScheduleSuccess),
                    take(1),
                    switchMap(() => {
                      store.dispatch(setGlobalLoading(false));
                      return of(true);
                    }),
                    catchError((error) => {
                      console.error('Error loading schedule:', error);
                      store.dispatch(loadScheduleFailure({ error }));
                      store.dispatch(setGlobalLoading(false));
                      router.navigate(['dashboard/error']);
                      return of(false);
                    }),
                  );
                }
              }),
              catchError((error) => {
                store.dispatch(loadScheduleFailure({ error }));
                store.dispatch(setGlobalLoading(false));
                console.error('Error loading schedule:', error);
                router.navigate(['dashboard/error']);
                return of(false);
              }),
            );
          }
        }),
      ),
    ),
  );
};
