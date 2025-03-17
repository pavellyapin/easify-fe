/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAction, props } from '@ngrx/store';

export const setPortfolioSearchResults = createAction(
  '[Portfolios] Set Search Results',
  props<{ results: any }>(),
);
