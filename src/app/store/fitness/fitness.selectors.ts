/* eslint-disable @typescript-eslint/no-unsafe-return */
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FitnessState } from './fitness.reducer';

export const selectFitnessState =
  createFeatureSelector<FitnessState>('fitness');

export const selectWorkoutsSearchResults = createSelector(
  selectFitnessState,
  (state) => state.searchResults,
);
