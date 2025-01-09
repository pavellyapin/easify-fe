/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAction, props } from '@ngrx/store';

export const loadRecipe = createAction('[Schedule] Load recipe');
export const loadNewRecipeSuccess = createAction(
  '[Schedule] Load new recipe Success',
  props<{ newRecipe: any }>(),
);
export const setSearchResults = createAction(
  '[Search] Set Search Results',
  props<{ results: any }>(),
);
export const loadNewRecipeFailure = createAction(
  '[Schedule] Load new recipe Failure',
  props<{ error: any }>(),
);
