/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import { createReducer, on } from '@ngrx/store';
import * as StartedGrowthActions from './started-growth.actions';

export interface StartedGrowthState {
  miniResume: any | null;
  responses: any[];
  loading: boolean;
  error: any;
}

export const initialState: StartedGrowthState = {
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
  on(StartedGrowthActions.clearStartedGrowth, (state) => ({
    ...state,
    miniResume: null,
    responses: [],
  })),
);
