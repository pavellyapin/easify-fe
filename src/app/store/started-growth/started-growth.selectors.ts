/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { StartedGrowthState } from './started-growth.reducer';

export const selectStartedGrowthState =
  createFeatureSelector<StartedGrowthState>('startedGrowth');

export const selectMiniResume = createSelector(
  selectStartedGrowthState,
  (state) => state.miniResume,
);

export const selectStartedGrowthLoading = createSelector(
  selectStartedGrowthState,
  (state) => state.loading,
);

export const selectStartedGrowthError = createSelector(
  selectStartedGrowthState,
  (state) => state.error,
);
