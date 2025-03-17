/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import { createReducer, on } from '@ngrx/store';
import {
  loadNewRecipeFailure,
  loadNewRecipeSuccess,
  loadRecipe,
  setRecipeSearchResults,
} from './recipe.actions';

export interface RecipeState {
  newRecipe: any | null;
  searchResults: any | null;
  error: any | null;
}

export const initialState: RecipeState = {
  newRecipe: null,
  error: null,
  searchResults: null,
};

export const recipeReducer = createReducer(
  initialState,
  on(loadRecipe, (state) => ({ ...state, error: null })),
  on(loadNewRecipeSuccess, (state, { newRecipe }) => ({ ...state, newRecipe })),
  on(setRecipeSearchResults, (state, { results }) => ({
    ...state,
    searchResults: results,
  })),
  on(loadNewRecipeFailure, (state, { error }) => ({ ...state, error })),
);
