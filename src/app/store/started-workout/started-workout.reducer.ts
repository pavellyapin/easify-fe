/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import { createReducer, on } from '@ngrx/store';
import * as StartedWorkoutActions from './started-workout.actions';

export interface StartedWorkoutState {
  startedWorkout: any | null;
  responses: any[];
  loading: boolean;
  error: any;
}

export const initialState: StartedWorkoutState = {
  startedWorkout: null,
  responses: [],
  loading: false,
  error: null,
};

export const startedWorkoutReducer = createReducer(
  initialState,
  on(StartedWorkoutActions.loadStartedWorkout, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(
    StartedWorkoutActions.loadStartedWorkoutSuccess,
    (state, { startedWorkout }) => ({
      ...state,
      startedWorkout,
      loading: false,
    }),
  ),
  on(StartedWorkoutActions.loadStartedWorkoutFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),
  on(StartedWorkoutActions.clearStartedWorkout, (state) => ({
    ...state,
    startedWorkout: null,
    responses: [],
  })),
  on(
    StartedWorkoutActions.loadWorkoutEasifyResponsesSuccess,
    (state, { responses }) => ({
      ...state,
      responses,
    }),
  ),
);
