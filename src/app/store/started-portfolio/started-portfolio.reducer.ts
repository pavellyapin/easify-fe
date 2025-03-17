/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import { createReducer, on } from '@ngrx/store';
import * as StartedPortfolioActions from './started-portfolio.actions';

export interface StartedPortfolioState {
  startedPortfolio: any | null;
  responses: any[];
  loading: boolean;
  error: any;
}

export const initialState: StartedPortfolioState = {
  startedPortfolio: null,
  responses: [],
  loading: false,
  error: null,
};

export const startedPortfolioReducer = createReducer(
  initialState,
  on(StartedPortfolioActions.loadStartedPortfolio, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(
    StartedPortfolioActions.loadStartedPortfolioSuccess,
    (state, { startedPortfolio }) => ({
      ...state,
      startedPortfolio,
      loading: false,
    }),
  ),
  on(
    StartedPortfolioActions.loadStartedPortfolioFailure,
    (state, { error }) => ({
      ...state,
      error,
      loading: false,
    }),
  ),
  on(StartedPortfolioActions.clearStartedPortfolio, (state) => ({
    ...state,
    startedPortfolio: null,
    responses: [],
  })),
  on(
    StartedPortfolioActions.loadPortfolioEasifyResponsesSuccess,
    (state, { responses }) => ({
      ...state,
      responses,
    }),
  ),
);
