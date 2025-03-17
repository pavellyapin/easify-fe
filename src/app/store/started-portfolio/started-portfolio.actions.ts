/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAction, props } from '@ngrx/store';

export const loadStartedPortfolio = createAction(
  '[Started Portfolio] Load Started Portfolio',
);

export const loadStartedPortfolioSuccess = createAction(
  '[Started Portfolio] Load Started Portfolio Success',
  props<{ startedPortfolio: any }>(),
);

export const loadStartedPortfolioFailure = createAction(
  '[Started Portfolio] Load Started Portfolio Failure',
  props<{ error: any }>(),
);

export const clearStartedPortfolio = createAction(
  '[Started Portfolio] Clear Started Portfolio',
);

export const loadPortfolioEasifyResponsesSuccess = createAction(
  '[Easify] Load Portfolio Easify Responses Success',
  props<{ responses: any[] }>(),
);
