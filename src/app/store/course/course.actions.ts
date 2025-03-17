/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAction, props } from '@ngrx/store';

export const loadCourse = createAction('[Course] Load course');
export const setCoursesSearchResults = createAction(
  '[Course] Set Search Results',
  props<{ results: any }>(),
);
