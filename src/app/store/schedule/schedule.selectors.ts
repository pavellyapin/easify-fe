/* eslint-disable @typescript-eslint/no-unsafe-return */
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ScheduleState } from './schedule.reducer';

// Selector to get the entire schedule state
export const selectScheduleState =
  createFeatureSelector<ScheduleState>('dailyLook');

// Selector to get today's schedule
export const selectSchedule = createSelector(
  selectScheduleState,
  (state: ScheduleState) => state.schedule,
);

// Selector to get tomorrow's schedule
export const selectTomorrow = createSelector(
  selectScheduleState,
  (state: ScheduleState) => state.tomorrow,
);

// Selector to check if the schedule is currently loading
export const selectIsScheduleLoading = createSelector(
  selectScheduleState,
  (state: ScheduleState) => state.loading,
);

// Selector to get the custom day request
export const selectCustomDayRequest = createSelector(
  selectScheduleState,
  (state: ScheduleState) => state.customRequest,
);

// Selector to get the basic-info from the custom day request
export const selectCustomDayBasicInfo = createSelector(
  selectCustomDayRequest,
  (customRequest) => customRequest.basicInfo || {},
);

// Selector to get the work-skills from the custom day request
export const selectCustomDayWorkSkills = createSelector(
  selectCustomDayRequest,
  (customRequest) => customRequest.workSkills || {},
);

// Selector to get the diet-nutrition from the custom day request
export const selectCustomDayDietNutrition = createSelector(
  selectCustomDayRequest,
  (customRequest) => customRequest.dietNutrition || {},
);

// Selector to get the health-lifestyle from the custom day request
export const selectCustomDayHealthLifestyle = createSelector(
  selectCustomDayRequest,
  (customRequest) => customRequest.healthLifestyle || {},
);
