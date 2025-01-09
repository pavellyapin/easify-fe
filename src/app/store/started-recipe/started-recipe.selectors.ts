/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { StartedRecipeState } from './started-recipe.reducer';

export const selectStartedRecipeState =
  createFeatureSelector<StartedRecipeState>('startedRecipe');

export const selectStartedRecipe = createSelector(
  selectStartedRecipeState,
  (state) => state.startedRecipe,
);

export const selectStartedRecipeLoading = createSelector(
  selectStartedRecipeState,
  (state) => state.loading,
);

export const selectStartedRecipeError = createSelector(
  selectStartedRecipeState,
  (state) => state.error,
);

export const selectEasifyRecipesResponses = createSelector(
  selectStartedRecipeState,
  (state) => state.responses,
);

export const selectRecipeEasifyResponsesByItemId = (itemId: string) =>
  createSelector(selectEasifyRecipesResponses, (responses) =>
    responses.filter((response) => response.itemId === itemId),
  );
