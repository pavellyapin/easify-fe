/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { createReducer, on } from '@ngrx/store';
import { refreshScheduleFailure } from '@store/schedule/schedule.actions';
import {
  setDashboardLoading,
  setGlobalLoading,
  setLoginLoading,
  setProfileLoading,
} from './loading.actions';

export interface LoaderState {
  loginLoading: boolean;
  dashboardLoading: boolean;
  profileLoading: boolean;
  globalLoading: boolean;
  globalLoadingMsg: string; // ✅ Store only ONE global message
}

export const initialState: LoaderState = {
  loginLoading: false,
  dashboardLoading: false,
  profileLoading: false,
  globalLoading: false,
  globalLoadingMsg: '',
};

export const loadingReducer = createReducer(
  initialState,
  on(setLoginLoading, (state, { isLoading }) => ({
    ...state,
    loginLoading: isLoading,
  })),
  on(setDashboardLoading, (state, { isLoading }) => ({
    ...state,
    dashboardLoading: isLoading,
  })),
  on(setProfileLoading, (state, { isLoading }) => ({
    ...state,
    profileLoading: isLoading,
  })),
  on(setGlobalLoading, (state, { isLoading, msg }) => ({
    ...state,
    globalLoading: isLoading,
    globalLoadingMsg: msg ?? state.globalLoadingMsg, // ✅ Update only global message
  })),
  // ✅ Stop loading and update error message when refresh fails
  on(refreshScheduleFailure, (state) => ({
    ...state,
    globalLoading: false,
    globalLoadingMsg: 'Failed to refresh schedule',
    dashboardLoading: false,
  })),
);
