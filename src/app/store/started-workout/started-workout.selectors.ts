/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { StartedWorkoutState } from './started-workout.reducer';

export const selectStartedWorkoutState =
  createFeatureSelector<StartedWorkoutState>('startedWorkout');

export const selectStartedWorkout = createSelector(
  selectStartedWorkoutState,
  (state) => state.startedWorkout,
);

export const selectStartedWorkoutLoading = createSelector(
  selectStartedWorkoutState,
  (state) => state.loading,
);

export const selectStartedWorkoutError = createSelector(
  selectStartedWorkoutState,
  (state) => state.error,
);
export const selectEasifyWorkoutResponses = createSelector(
  selectStartedWorkoutState,
  (state) => state.responses,
);

export const selectWorkoutEasifyResponsesByItemId = (itemId: string) =>
  createSelector(selectEasifyWorkoutResponses, (responses) =>
    responses.filter((response) => response.itemId === itemId),
  );
