/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import { createReducer, on } from '@ngrx/store';
import {
  clearSchedule,
  clearTomorrow,
  loadSchedule,
  loadScheduleFailure,
  loadScheduleSuccess,
  loadTomorrow,
  loadTomorrowFailure,
  loadTomorrowSuccess,
  refreshSchedule,
  refreshScheduleFailure,
  refreshScheduleSuccess,
  submitCustomDayRequestFromAPI,
  updateCustomDayBasicInfo,
  updateCustomDayDietNutrition,
  updateCustomDayHealthLifestyle,
  updateCustomDayWorkSkills,
  updateTodayRecommendations,
  updateTomorrowRecommendations,
} from './schedule.actions';

export interface ScheduleState {
  schedule: any | null; // Today's schedule
  tomorrow: any | null; // Tomorrow's schedule
  customRequest: {
    basicInfo: any;
    workSkills: any;
    healthLifestyle: any;
    dietNutrition: any;
  };
  error: any | null;
  loading: boolean; // Loading state for both today and tomorrow schedules
}

export const initialState: ScheduleState = {
  schedule: null,
  tomorrow: null,
  customRequest: {
    basicInfo: null,
    workSkills: null,
    healthLifestyle: null,
    dietNutrition: null,
  },
  error: null,
  loading: false,
};

export const scheduleReducer = createReducer(
  initialState,

  // Trigger loading for loadSchedule
  on(loadSchedule, (state) => ({
    ...state,
    schedule: null,
    error: null,
    loading: true,
  })),

  // Set schedule and stop loading on load success
  on(loadScheduleSuccess, (state, { scheduleData }) => ({
    ...state,
    schedule: scheduleData,
    loading: false,
  })),

  // Set error and stop loading on load failure
  on(loadScheduleFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Trigger loading for refreshSchedule
  on(refreshSchedule, (state) => ({
    ...state,
    error: null,
    loading: true,
  })),

  // Trigger loading for refreshSchedule
  on(submitCustomDayRequestFromAPI, (state) => ({
    ...state,
    error: null,
    loading: true,
  })),

  // Set schedule and stop loading on refresh success
  on(refreshScheduleSuccess, (state, { scheduleData }) => ({
    ...state,
    schedule: scheduleData,
    loading: false,
  })),

  // Set error and stop loading on refresh failure
  on(refreshScheduleFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Trigger loading for tomorrow's schedule
  on(loadTomorrow, (state) => ({
    ...state,
    tomorrow: null,
    error: null,
    loading: true,
  })),

  // Trigger loading for tomorrow's schedule
  on(clearTomorrow, (state) => ({
    ...state,
    tomorrow: null,
    error: null,
    loading: false,
  })),

  // Set tomorrow schedule and stop loading on success
  on(loadTomorrowSuccess, (state, { tomorrowData }) => ({
    ...state,
    tomorrow: tomorrowData,
    loading: false,
  })),

  // Set error for tomorrow load failure and stop loading
  on(loadTomorrowFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Update custom day basic info
  on(updateCustomDayBasicInfo, (state, { basicInfo }) => ({
    ...state,
    customRequest: {
      ...state.customRequest,
      basicInfo,
    },
  })),

  // Update custom day work skills
  on(updateCustomDayWorkSkills, (state, { workSkills }) => ({
    ...state,
    customRequest: {
      ...state.customRequest,
      workSkills,
    },
  })),

  // Update custom day health & lifestyle
  on(updateCustomDayHealthLifestyle, (state, { lifestyleHealth }) => ({
    ...state,
    customRequest: {
      ...state.customRequest,
      healthLifestyle: lifestyleHealth,
    },
  })),

  // Update custom day diet & nutrition
  on(updateCustomDayDietNutrition, (state, { dietNutrition }) => ({
    ...state,
    customRequest: {
      ...state.customRequest,
      dietNutrition,
    },
  })),

  // Update recommendations for a specific time slot in today's schedule
  on(
    updateTodayRecommendations,
    (state, { timeSlotIndex, recommendations }) => {
      if (!state.schedule?.schedule) {
        return state; // If no schedule, return current state
      }

      const updatedSchedule = [...state.schedule.schedule]; // Clone schedule array
      updatedSchedule[timeSlotIndex] = {
        ...updatedSchedule[timeSlotIndex],
        recommendedItems: recommendations,
      };

      return {
        ...state,
        schedule: {
          ...state.schedule,
          schedule: updatedSchedule,
        },
      };
    },
  ),

  // Update recommendations for a specific time slot in tomorrow's schedule
  on(
    updateTomorrowRecommendations,
    (state, { timeSlotIndex, recommendations }) => {
      if (!state.tomorrow?.schedule) {
        return state; // If no schedule, return current state
      }

      const updatedSchedule = [...state.tomorrow.schedule]; // Clone schedule array
      updatedSchedule[timeSlotIndex] = {
        ...updatedSchedule[timeSlotIndex],
        recommendedItems: recommendations,
      };

      return {
        ...state,
        tomorrow: {
          ...state.tomorrow,
          schedule: updatedSchedule,
        },
      };
    },
  ),

  // Clear schedule and tomorrow state
  on(clearSchedule, () => initialState),
);
