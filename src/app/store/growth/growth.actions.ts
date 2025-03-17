/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAction, props } from '@ngrx/store';

export const loadGrowth = createAction('[Growth] Load growth');
export const setIndustriesSearchResults = createAction(
  '[Growth] Set Search Results',
  props<{ results: any }>(),
);
