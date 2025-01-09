/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import { createReducer, on } from '@ngrx/store';
import * as StartedRecipeActions from './started-recipe.actions';

export interface StartedRecipeState {
  startedRecipe: any | null;
  responses: any[];
  loading: boolean;
  error: any;
}

export const initialState: StartedRecipeState = {
  startedRecipe: null,
  responses: [],
  loading: false,
  error: null,
};

export const startedRecipeReducer = createReducer(
  initialState,
  on(StartedRecipeActions.loadStartedRecipe, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(
    StartedRecipeActions.loadStartedRecipeSuccess,
    (state, { startedRecipe }) => ({
      ...state,
      startedRecipe,
      loading: false,
    }),
  ),
  on(StartedRecipeActions.loadStartedRecipeFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),
  on(StartedRecipeActions.clearStartedRecipe, (state) => ({
    ...state,
    startedRecipe: null,
    responses: [],
  })),
  on(
    StartedRecipeActions.loadRecipeEasifyResponsesSuccess,
    (state, { responses }) => ({
      ...state,
      responses,
    }),
  ),
);
