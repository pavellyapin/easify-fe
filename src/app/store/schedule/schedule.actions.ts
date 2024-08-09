/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAction, props } from '@ngrx/store';

export const loadSchedule = createAction('[Schedule] Load Schedule');
export const loadScheduleSuccess = createAction(
  '[Schedule] Load Schedule Success',
  props<{ schedule: any }>(), // Adjust type according to your actual schedule structure
);
export const loadScheduleFailure = createAction(
  '[Schedule] Load Schedule Failure',
  props<{ error: any }>(),
);
