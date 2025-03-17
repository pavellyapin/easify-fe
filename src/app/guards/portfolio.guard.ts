/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  UrlTree,
} from '@angular/router';
import { Store } from '@ngrx/store';
import { FinancialProgressService } from '@services/financial-progress.service';
import { FinancialPlansService } from '@services/financial.service';
import { AssetClass, AssetClassValue } from '@store/fitness/finance.model';
import * as StartedPortfolioActions from '@store/started-portfolio/started-portfolio.actions';

@Injectable({
  providedIn: 'root',
})
export class PortfolioGuard implements CanActivate {
  constructor(
    private portfolioService: FinancialPlansService,
    private portfolioProgressService: FinancialProgressService,
    private router: Router,
    private store: Store,
  ) {}

  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean | UrlTree> {
    const portfolioId = route.paramMap.get('id')!;
    try {
      // Fetch the portfolio by ID
      const portfolio =
        await this.portfolioService.getPortfolioById(portfolioId);

      if (!portfolio) {
        // If portfolio does not exist, redirect to a 404 page
        console.error(`Portfolio with ID ${portfolioId} not found.`);
        return this.router.parseUrl('error');
      }

      route.data = { portfolio };

      // Check if the user has already started tracking this portfolio
      const startedPortfolio =
        await this.portfolioProgressService.getStartedPortfolioById(
          portfolioId,
        );

      if (!startedPortfolio) {
        const filteredPortfolioValues = (
          portfolio.portfolioValues || []
        ).filter((value: any) => {
          const dateParts = value.date.split('-');
          return dateParts[2] === '01';
        });
        // If no started portfolio exists, create one
        const newPortfolioItem = {
          id: portfolioId,
          createdDate: portfolio.createdDate,
          name: portfolio.name,
          description: portfolio.description,
          category: portfolio.category,
          riskLevel: portfolio.riskLevel,
          isNew: portfolio.isNew ? portfolio.isNew : false,
          portfolioValues: filteredPortfolioValues,
          tags: portfolio.tags,
          holdings: portfolio.holdings,
        };

        const lastPortfolioValue =
          portfolio.portfolioValues[portfolio.portfolioValues.length - 1];
        const totalValue = lastPortfolioValue.totalValue || 1; // Prevent division by zero

        const computedAllocations = Object.values(AssetClassValue) // ✅ Use Enum Directly
          .map((mappedKey) => {
            const assetValue = lastPortfolioValue[mappedKey] || 0;
            const percentage = (assetValue / totalValue) * 100;

            // ✅ Convert AssetClassValue key back to AssetClass name
            const assetClassName =
              Object.keys(AssetClass).find(
                (key) =>
                  AssetClassValue[key as keyof typeof AssetClassValue] ===
                  mappedKey,
              ) ?? mappedKey; // Default to mappedKey if not found

            return {
              name: AssetClass[assetClassName as keyof typeof AssetClass],
              percentage,
              complete: false,
            };
          })
          .filter((item) => item.percentage > 0) // ✅ Remove zero allocation classes
          .sort((a, b) => b.percentage - a.percentage); // ✅ Sort by highest allocation
        const totalTickers = portfolio.holdings ? portfolio.holdings.length : 0;

        const progress = {
          totalTickers: totalTickers,
          completeTickers: 0,
          progress: 0,
          assetClass: computedAllocations,
        };

        await this.portfolioProgressService.addPortfolioStart(
          newPortfolioItem,
          progress,
        );

        const startedPortfolio =
          await this.portfolioProgressService.getStartedPortfolioById(
            portfolioId,
          );

        // Store new started portfolio in route data
        route.data = { portfolio };

        // Dispatch action to store portfolio data in NgRx store
        this.store.dispatch(
          StartedPortfolioActions.loadStartedPortfolioSuccess({
            startedPortfolio,
          }),
        );

        return true;
      }

      // Dispatch action to store the started portfolio in state
      this.store.dispatch(
        StartedPortfolioActions.loadStartedPortfolioSuccess({
          startedPortfolio,
        }),
      );

      // Fetch Easify responses for the portfolio
      const easifyResponses =
        await this.portfolioProgressService.getEasifyResponsesByItemId(
          portfolioId,
        );

      // Dispatch action to store Easify responses in state
      this.store.dispatch(
        StartedPortfolioActions.loadPortfolioEasifyResponsesSuccess({
          responses: easifyResponses,
        }),
      );
      // Allow navigation
      return true;
    } catch (error) {
      console.error('Error in portfolio guard:', error);
      return this.router.parseUrl('/error'); // Redirect to error page if an error occurs
    }
  }
}
