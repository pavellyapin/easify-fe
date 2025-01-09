/* eslint-disable @typescript-eslint/no-unsafe-return */
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { RecipeState } from './recipe.reducer';

export const selectRecipesState = createFeatureSelector<RecipeState>('recipe');

export const selectRecipeSearchResults = createSelector(
  selectRecipesState,
  (state) => state.searchResults,
);

export const selectNewRecipe = createSelector(
  selectRecipesState,
  (state: RecipeState) => state.newRecipe,
);
