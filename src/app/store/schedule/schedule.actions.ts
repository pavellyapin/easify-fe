/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAction, props } from '@ngrx/store';

export const loadSchedule = createAction('[Schedule] Load Schedule');
export const loadScheduleSuccess = createAction(
  '[Schedule] Load Schedule Success',
  props<{ scheduleData: any }>(), // Adjust type according to your actual schedule structure
);
export const loadScheduleFailure = createAction(
  '[Schedule] Load Schedule Failure',
  props<{ error: any }>(),
);
export const loadTomorrow = createAction('[Schedule] Load Tomorrow');
export const loadTomorrowSuccess = createAction(
  '[Schedule] Load Tomorrow Success',
  props<{ tomorrowData: any }>(),
);
export const loadTomorrowFailure = createAction(
  '[Schedule] Load Tomorrow Failure',
  props<{ error: any }>(),
);
export const refreshSchedule = createAction('[Schedule] Refresh Schedule');
export const refreshScheduleSuccess = createAction(
  '[Schedule] Refresh Schedule Success',
  props<{ scheduleData: any }>(),
);
export const refreshScheduleFailure = createAction(
  '[Schedule] Refresh Schedule Failure',
  props<{ error: any }>(),
);

// Actions for updating each section of the custom day
export const updateCustomDayBasicInfo = createAction(
  '[Custom Day] Update Basic Info',
  props<{ basicInfo: any }>(),
);

export const updateCustomDayWorkSkills = createAction(
  '[Custom Day] Update Work Skills',
  props<{ workSkills: any }>(),
);

export const updateCustomDayHealthLifestyle = createAction(
  '[Custom Day] Update Health & Lifestyle',
  props<{ lifestyleHealth: any }>(),
);

export const updateCustomDayDietNutrition = createAction(
  '[Custom Day] Update Diet & Nutrition',
  props<{ dietNutrition: any }>(),
);

// Action to submit the entire custom day request
export const submitCustomDayRequest = createAction(
  '[Custom Day] Submit Request',
  props<{ customDayRequest: any }>(),
);

// Action to clear the schedule state
export const clearSchedule = createAction('[Schedule] Clear Schedule');
// Action to clear the schedule state
export const clearTomorrow = createAction(
  '[Schedule] Clear Tomorrows Schedule',
);
