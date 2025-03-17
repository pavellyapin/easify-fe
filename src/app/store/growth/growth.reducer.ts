/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import { createReducer, on } from '@ngrx/store';
import { loadGrowth, setIndustriesSearchResults } from './growth.actions';

export interface GrowthState {
  searchResults: any | null;
  error: any | null;
}

export const initialState: GrowthState = {
  error: null,
  searchResults: null,
};

export const growthReducer = createReducer(
  initialState,
  on(loadGrowth, (state) => ({ ...state, error: null })),
  on(setIndustriesSearchResults, (state, { results }) => ({
    ...state,
    searchResults: results,
  })),
);
