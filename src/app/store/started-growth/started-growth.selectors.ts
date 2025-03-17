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

export const selectStartedIndustry = createSelector(
  selectStartedGrowthState,
  (state) => state.startedIndustry,
);

export const selectStartedGrowthLoading = createSelector(
  selectStartedGrowthState,
  (state) => state.loading,
);

export const selectStartedGrowthError = createSelector(
  selectStartedGrowthState,
  (state) => state.error,
);

export const selectEasifyIndustryResponses = createSelector(
  selectStartedGrowthState,
  (state) => state.responses,
);

export const selectIndustryEasifyResponsesByItemId = (itemId: string) =>
  createSelector(selectEasifyIndustryResponses, (responses) =>
    responses.filter((response) => response.itemId === itemId),
  );
