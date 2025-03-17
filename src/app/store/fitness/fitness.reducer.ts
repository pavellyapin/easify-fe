/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import { createReducer, on } from '@ngrx/store';
import { loadFitness, setWorkoutsSearchResults } from './fitness.actions';

export interface FitnessState {
  searchResults: any | null;
  error: any | null;
}

export const initialState: FitnessState = {
  error: null,
  searchResults: null,
};

export const fitnessReducer = createReducer(
  initialState,
  on(loadFitness, (state) => ({ ...state, error: null })),
  on(setWorkoutsSearchResults, (state, { results }) => ({
    ...state,
    searchResults: results,
  })),
);
