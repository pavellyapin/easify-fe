/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import { createReducer, on } from '@ngrx/store';
import * as StartedGrowthActions from './started-growth.actions';

export interface StartedGrowthState {
  startedIndustry: any | null;
  miniResume: any | null;
  responses: any[];
  loading: boolean;
  error: any;
}

export const initialState: StartedGrowthState = {
  startedIndustry: null,
  miniResume: null,
  responses: [],
  loading: false,
  error: null,
};

export const startedGrowthReducer = createReducer(
  initialState,
  on(StartedGrowthActions.loadMiniResume, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(StartedGrowthActions.loadMiniResumeSuccess, (state, { miniResume }) => ({
    ...state,
    miniResume,
    loading: false,
  })),
  on(StartedGrowthActions.loadMiniResumeFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),
  on(StartedGrowthActions.loadStartedIndustry, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(
    StartedGrowthActions.loadStartedIndustrySuccess,
    (state, { startedIndustry }) => ({
      ...state,
      startedIndustry,
      loading: false,
    }),
  ),
  on(StartedGrowthActions.loadMiniResumeFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),
  on(
    StartedGrowthActions.loadIndustryEasifyResponsesSuccess,
    (state, { responses }) => ({
      ...state,
      responses,
    }),
  ),
  on(StartedGrowthActions.clearStartedGrowth, (state) => ({
    ...state,
    startedIndustry: null,
    miniResume: null,
    responses: [],
  })),
);
