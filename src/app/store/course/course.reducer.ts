/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import { createReducer, on } from '@ngrx/store';
import { loadCourse, setCoursesSearchResults } from './course.actions';

export interface CourseState {
  searchResults: any | null;
  error: any | null;
}

export const initialState: CourseState = {
  error: null,
  searchResults: null,
};

export const courseReducer = createReducer(
  initialState,
  on(loadCourse, (state) => ({ ...state, error: null })),
  on(setCoursesSearchResults, (state, { results }) => ({
    ...state,
    searchResults: results,
  })),
);
