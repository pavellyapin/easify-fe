/* eslint-disable @typescript-eslint/no-unsafe-return */
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { LoaderState } from './loading.reducer';

export const selectLoadingState = createFeatureSelector<LoaderState>('loader');

export const isLoading = createSelector(
  selectLoadingState,
  (state: LoaderState) => state.loading,
);
