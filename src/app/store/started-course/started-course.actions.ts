/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAction, props } from '@ngrx/store';

export const loadStartedCourse = createAction(
  '[Started Course] Load Started Course',
);

export const loadStartedCourseSuccess = createAction(
  '[Started Course] Load Started Course Success',
  props<{ startedCourse: any }>(),
);

export const loadStartedCourseFailure = createAction(
  '[Started Course] Load Started Course Failure',
  props<{ error: any }>(),
);

export const clearStartedCourse = createAction(
  '[Started Course] Clear Started Course',
);

export const loadCourseEasifyResponsesSuccess = createAction(
  '[Easify] Load Course Easify Responses Success',
  props<{ responses: any[] }>(),
);
