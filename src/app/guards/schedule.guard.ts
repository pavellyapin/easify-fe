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
          const loadingMessages = [
            "We're carefully crafting your daily schedule to help you stay productive, balanced, and focused. Hang tight while we put everything in place.",
            "Your personalized daily plan is on the way! We're organizing your tasks, workouts, and meals to give you the best possible day.",
            'Give us a moment while we tailor your schedule to match your goals, priorities, and habits. A well-structured day leads to better results!',
            "We're optimizing your schedule to ensure you get the right mix of work, rest, and personal growth. Your custom plan will be ready shortly.",
            "Designing a day that works best for you takes a little time. We're arranging everything so that your day flows smoothly and efficiently.",
            'Your schedule is being built with care, making sure every hour is filled with the right balance of focus, energy, and relaxation.',
          ];

          const randomMsg =
            loadingMessages[Math.floor(Math.random() * loadingMessages.length)];

          store.dispatch(
            setGlobalLoading({ isLoading: true, msg: randomMsg! }),
          );
          const today = new Date().toLocaleDateString('en-CA');

          // If tomorrow's schedule exists and has today's date, clear it
          if (tomorrowSchedule?.id === today) {
            store.dispatch(clearTomorrow());
          }

          // Proceed with the usual logic for loading today's schedule
          if (todaySchedule && todaySchedule?.id === today) {
            store.dispatch(setGlobalLoading({ isLoading: false }));
            return of(true);
          } else {
            return scheduleService.getTodaySchedule(today).pipe(
              switchMap((schedules) => {
                if (schedules.length > 0) {
                  const scheduleData = schedules[0];
                  store.dispatch(loadScheduleSuccess({ scheduleData }));
                  store.dispatch(setGlobalLoading({ isLoading: false }));
                  return of(true);
                } else {
                  const dailyRequest = { type: 'short' };

                  chatService.getDaily(dailyRequest, 'getDaily'); // Initiate WebSocket request

                  return actions$.pipe(
                    ofType(loadScheduleSuccess),
                    take(1),
                    switchMap(() => {
                      store.dispatch(setGlobalLoading({ isLoading: false }));
                      return of(true);
                    }),
                    catchError((error) => {
                      console.error('Error loading schedule:', error);
                      store.dispatch(loadScheduleFailure({ error }));
                      store.dispatch(setGlobalLoading({ isLoading: false }));
                      router.navigate(['dashboard/error']);
                      return of(false);
                    }),
                  );
                }
              }),
              catchError((error) => {
                store.dispatch(loadScheduleFailure({ error }));
                store.dispatch(setGlobalLoading({ isLoading: false }));
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
