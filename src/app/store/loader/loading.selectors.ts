/* eslint-disable @typescript-eslint/no-unsafe-return */
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { LoaderState } from './loading.reducer';

export const selectLoadingState = createFeatureSelector<LoaderState>('loader');

export const isLoginLoading = createSelector(
  selectLoadingState,
  (state: LoaderState) => state.loginLoading,
);

export const isDashboardLoading = createSelector(
  selectLoadingState,
  (state: LoaderState) => state.dashboardLoading,
);

export const isProfileLoading = createSelector(
  selectLoadingState,
  (state: LoaderState) => state.profileLoading,
);

// ✅ Extract only the `msg` from `dashboardLoading`
export const selectDashboardLoadingMsg = createSelector(
  selectLoadingState,
  (dashboardLoading) => dashboardLoading.globalLoadingMsg,
);

export const isGlobalLoading = createSelector(
  selectLoadingState,
  (state: LoaderState) => state.globalLoading,
);
