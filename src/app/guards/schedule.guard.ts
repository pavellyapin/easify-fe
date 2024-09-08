import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { catchError, map, of, switchMap, take } from 'rxjs';
import { EasifyService } from '../services/easify.service';
import { ScheduleService } from '../services/schedule.service';
import { UserService } from '../services/user.service';
import { AppState } from '../store/app.state';
import { setLoading } from '../store/loader/loading.actions';
import {
  loadScheduleFailure,
  loadScheduleSuccess,
} from '../store/schedule/schedule.actions';
import { selectSchedule } from '../store/schedule/schedule.selectors';

export const scheduleGuard: CanActivateFn = () => {
  const router = inject(Router);
  const store = inject(Store<AppState>);
  const scheduleService = inject(ScheduleService);
  const userService = inject(UserService);
  const chatService = inject(EasifyService);

  return store.select(selectSchedule).pipe(
    take(1),
    switchMap((schedule) => {
      store.dispatch(setLoading(true));
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      if (schedule && schedule.schedule.schedule.date == today) {
        store.dispatch(setLoading(false));
        return of(true);
      } else {
        return scheduleService.getTodaySchedule().pipe(
          switchMap((schedules) => {
            if (schedules.length > 0) {
              store.dispatch(loadScheduleSuccess(schedules[0]));
              store.dispatch(setLoading(false));
              return of(true);
            } else {
              return fetchAndSaveSchedule(
                userService,
                chatService,
                store,
                scheduleService,
              );
            }
          }),
          catchError((error) => {
            store.dispatch(loadScheduleFailure({ error }));
            console.error('Error loading schedule:', error);
            router.navigate(['/error']); // Redirect to an error page or handle as needed
            return of(false);
          }),
        );
      }
    }),
  );
};

const fetchAndSaveSchedule = (
  userService: UserService,
  chatService: EasifyService,
  store: Store<AppState>,
  scheduleService: ScheduleService,
) => {
  return userService.getAnswersObservable().pipe(
    switchMap((savedQuestions) => {
      const formattedQuestions = savedQuestions.map((q) => ({
        role: 'user',
        content: `${q.question}: ${q.answer}`,
      }));
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };
      const today = new Date().toLocaleDateString('en-US', options);
      const todayFormatted = `Today is ${today.replace(/,/, '')}`;
      formattedQuestions.push({
        role: 'user',
        content: todayFormatted,
      });

      return chatService.getDaily(formattedQuestions).pipe(
        map((schedule) => {
          store.dispatch(loadScheduleSuccess({ schedule }));
          scheduleService.saveScheduleToFirestore(schedule);
          store.dispatch(setLoading(false));
          return true;
        }),
        catchError((error) => {
          console.error('Error generating schedule:', error);
          store.dispatch(loadScheduleFailure({ error }));
          store.dispatch(setLoading(false));
          return of(false);
        }),
      );
    }),
    catchError((error) => {
      console.error('Error fetching questions:', error);
      store.dispatch(loadScheduleFailure({ error }));
      return of(false);
    }),
  );
};
