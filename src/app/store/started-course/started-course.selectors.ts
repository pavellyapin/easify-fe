/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { StartedCourseState } from './started-course.reducer';

export const selectStartedCourseState =
  createFeatureSelector<StartedCourseState>('startedCourse');

export const selectStartedCourse = createSelector(
  selectStartedCourseState,
  (state) => state.startedCourse,
);

export const selectStartedCourseLoading = createSelector(
  selectStartedCourseState,
  (state) => state.loading,
);

export const selectStartedCourseError = createSelector(
  selectStartedCourseState,
  (state) => state.error,
);

export const selectEasifyCourseResponses = createSelector(
  selectStartedCourseState,
  (state) => state.responses,
);

export const selectEasifyResponsesByItemId = (itemId: string) =>
  createSelector(selectEasifyCourseResponses, (responses) =>
    responses.filter((response) => response.itemId === itemId),
  );
