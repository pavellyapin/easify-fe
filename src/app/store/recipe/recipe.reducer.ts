/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import { createReducer, on } from '@ngrx/store';
import {
  loadNewRecipeFailure,
  loadNewRecipeSuccess,
  loadRecipe,
} from './recipe.actions';

export interface RecipeState {
  newRecipe: any | null;
  error: any | null;
}

export const initialState: RecipeState = {
  newRecipe: null,
  error: null,
};

export const recipeReducer = createReducer(
  initialState,
  on(loadRecipe, (state) => ({ ...state, schedule: null, error: null })),
  on(loadNewRecipeSuccess, (state, { newRecipe }) => ({ ...state, newRecipe })),
  on(loadNewRecipeFailure, (state, { error }) => ({ ...state, error })),
);
