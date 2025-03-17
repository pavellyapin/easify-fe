/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { StartedPortfolioState } from './started-portfolio.reducer';

export const selectStartedPortfolioState =
  createFeatureSelector<StartedPortfolioState>('startedPortfolio');

export const selectStartedPortfolio = createSelector(
  selectStartedPortfolioState,
  (state) => state.startedPortfolio,
);

export const selectStartedPortfolioLoading = createSelector(
  selectStartedPortfolioState,
  (state) => state.loading,
);

export const selectStartedPortfolioError = createSelector(
  selectStartedPortfolioState,
  (state) => state.error,
);

export const selectEasifyPortfolioResponses = createSelector(
  selectStartedPortfolioState,
  (state) => state.responses,
);

export const selectPortfolioEasifyResponsesByItemId = (itemId: string) =>
  createSelector(selectEasifyPortfolioResponses, (responses) =>
    responses.filter((response) => response.itemId === itemId),
  );
