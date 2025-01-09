/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAction, props } from '@ngrx/store';

export const loadStartedWorkout = createAction(
  '[Started Workout] Load Started Workout',
);

export const loadStartedWorkoutSuccess = createAction(
  '[Started Workout] Load Started Workout Success',
  props<{ startedWorkout: any }>(),
);

export const loadStartedWorkoutFailure = createAction(
  '[Started Workout] Load Started Workout Failure',
  props<{ error: any }>(),
);

export const clearStartedWorkout = createAction(
  '[Started Workout] Clear Started Workout',
);

export const loadWorkoutEasifyResponsesSuccess = createAction(
  '[Easify] Load workout Easify Responses Success',
  props<{ responses: any[] }>(),
);
