/* eslint-disable @typescript-eslint/no-unsafe-return */
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { RecipeState } from './recipe.reducer';

export const selectScheduleState = createFeatureSelector<RecipeState>('recipe');

export const selectNewRecipe = createSelector(
  selectScheduleState,
  (state: RecipeState) => state.newRecipe,
);
