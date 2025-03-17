/* eslint-disable @typescript-eslint/no-unsafe-return */
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CourseState } from './course.reducer';

export const selectCourseState = createFeatureSelector<CourseState>('course');

export const selectCourseSearchResults = createSelector(
  selectCourseState,
  (state) => state.searchResults,
);
