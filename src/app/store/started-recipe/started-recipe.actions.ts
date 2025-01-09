/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAction, props } from '@ngrx/store';

// Action to load the started recipe
export const loadStartedRecipe = createAction(
  '[Started Recipe] Load Started Recipe',
);

// Action dispatched when the started recipe is successfully loaded
export const loadStartedRecipeSuccess = createAction(
  '[Started Recipe] Load Started Recipe Success',
  props<{ startedRecipe: any }>(),
);

// Action dispatched when there is an error loading the started recipe
export const loadStartedRecipeFailure = createAction(
  '[Started Recipe] Load Started Recipe Failure',
  props<{ error: any }>(),
);

// Action to clear the current started recipe
export const clearStartedRecipe = createAction(
  '[Started Recipe] Clear Started Recipe',
);

export const loadRecipeEasifyResponsesSuccess = createAction(
  '[Easify] Load recipe Easify Responses Success',
  props<{ responses: any[] }>(),
);
