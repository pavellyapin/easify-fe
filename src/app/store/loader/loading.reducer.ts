/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { createReducer, on } from '@ngrx/store';
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
}

export const initialState: LoaderState = {
  loginLoading: false,
  dashboardLoading: false,
  profileLoading: false,
  globalLoading: false,
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
  on(setGlobalLoading, (state, { isLoading }) => ({
    ...state,
    globalLoading: isLoading,
  })),
);
