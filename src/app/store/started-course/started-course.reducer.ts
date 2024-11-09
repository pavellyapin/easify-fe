/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import { createReducer, on } from '@ngrx/store';
import * as StartedCourseActions from './started-course.actions';

export interface StartedCourseState {
  startedCourse: any | null;
  loading: boolean;
  error: any;
}

export const initialState: StartedCourseState = {
  startedCourse: null,
  loading: false,
  error: null,
};

export const startedCourseReducer = createReducer(
  initialState,
  on(StartedCourseActions.loadStartedCourse, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(
    StartedCourseActions.loadStartedCourseSuccess,
    (state, { startedCourse }) => ({
      ...state,
      startedCourse,
      loading: false,
    }),
  ),
  on(StartedCourseActions.loadStartedCourseFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),
  on(StartedCourseActions.clearStartedCourse, (state) => ({
    ...state,
    startedCourse: null,
  })),
);
