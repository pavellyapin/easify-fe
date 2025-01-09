/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAction, props } from '@ngrx/store';

export const loadMiniResume = createAction('[Started Growth] Load Mini resume');

export const loadMiniResumeSuccess = createAction(
  '[Started Growth] Load mini resume Success',
  props<{ miniResume: any }>(),
);

export const loadMiniResumeFailure = createAction(
  '[Started growth] Load mini resume Failure',
  props<{ error: any }>(),
);

// Action to clear the current started recipe
export const clearStartedGrowth = createAction(
  '[Started growth] Clear Started growth',
);
