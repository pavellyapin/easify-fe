/* eslint-disable @typescript-eslint/no-unsafe-return */
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ScheduleState } from './schedule.reducer';

export const selectScheduleState =
  createFeatureSelector<ScheduleState>('dailyLook');

export const selectSchedule = createSelector(
  selectScheduleState,
  (state: ScheduleState) => state.schedule,
);
