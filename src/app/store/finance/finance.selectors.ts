/* eslint-disable @typescript-eslint/no-unsafe-return */
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FinanceState } from './finance.reducer';

export const selectFinanceState =
  createFeatureSelector<FinanceState>('finance');

export const selectPortfolioSearchResults = createSelector(
  selectFinanceState,
  (state) => state.searchResults,
);
