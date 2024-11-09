import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { EasifyService } from '@services/easify.service';
import { ScheduleService } from '@services/schedule.service';
import { AppState } from '@store/app.state';
import { setLoading } from '@store/loader/loading.actions';
import {
  clearTomorrow,
  loadScheduleFailure,
  loadScheduleSuccess,
} from '@store/schedule/schedule.actions';
import {
  selectSchedule,
  selectTomorrow,
} from '@store/schedule/schedule.selectors';
import { catchError, map, mergeMap, of, switchMap, take } from 'rxjs';

export const scheduleGuard: CanActivateFn = () => {
  const router = inject(Router);
  const store = inject(Store<AppState>);
  const scheduleService = inject(ScheduleService);
  const chatService = inject(EasifyService);

  return store.select(selectSchedule).pipe(
    take(1),
    mergeMap((todaySchedule) =>
      store.select(selectTomorrow).pipe(
        take(1),
        switchMap((tomorrowSchedule) => {
          store.dispatch(setLoading(true));
          const today = new Date().toLocaleDateString('en-CA');

          // If tomorrow's schedule exists and has today's date, clear it
          if (tomorrowSchedule?.id === today) {
            store.dispatch(clearTomorrow());
          }

          // Proceed with the usual logic for loading today's schedule
          if (todaySchedule && todaySchedule?.id === today) {
            store.dispatch(setLoading(false));
            return of(true);
          } else {
            return scheduleService.getTodaySchedule(today).pipe(
              switchMap((schedules) => {
                if (schedules.length > 0) {
                  const scheduleData = schedules[0];
                  store.dispatch(loadScheduleSuccess({ scheduleData }));
                  store.dispatch(setLoading(false));
                  return of(true);
                } else {
                  return chatService.getDaily().pipe(
                    map((schedule) => {
                      store.dispatch(
                        loadScheduleSuccess({
                          scheduleData: schedule.schedule,
                        }),
                      );
                      store.dispatch(setLoading(false));
                      return true;
                    }),
                  );
                }
              }),
              catchError((error) => {
                store.dispatch(loadScheduleFailure({ error }));
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
