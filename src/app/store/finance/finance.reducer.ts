/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import { createReducer, on } from '@ngrx/store';
import { setPortfolioSearchResults } from './finance.actions';

export interface FinanceState {
  searchResults: any | null;
  error: any | null;
}

export const initialState: FinanceState = {
  error: null,
  searchResults: null,
};

export const financeReducer = createReducer(
  initialState,
  on(setPortfolioSearchResults, (state, { results }) => ({
    ...state,
    searchResults: results,
  })),
);
