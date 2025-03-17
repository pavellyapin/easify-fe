/* eslint-disable @typescript-eslint/no-unsafe-return */
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { GrowthState } from './growth.reducer';

export const selectGrowthState = createFeatureSelector<GrowthState>('growth');

export const selectIndustrySearchResults = createSelector(
  selectGrowthState,
  (state) => state.searchResults,
);
