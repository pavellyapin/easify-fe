/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAction, props } from '@ngrx/store';

export const loadFitness = createAction('[Fitness] Load course');
export const setWorkoutsSearchResults = createAction(
  '[Fitness] Set Search Results',
  props<{ results: any }>(),
);
