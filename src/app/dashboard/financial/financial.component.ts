/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { LoadingCarouselComponent } from '@components/loading-carousel/loading-carousel.component';
import { SuggestedActionComponent } from '@components/suggested-action/suggested-action.component';
import { ChallengeService } from '@services/challenges.service';
import { FinancialProgressService } from '@services/financial-progress.service';
import { FinancialPlansService } from '@services/financial.service';
import { combineLatest, Observable, of, Subscription } from 'rxjs';
import { catchError, finalize, map, take } from 'rxjs/operators';
import { AllPortfoliosComponent } from './all-portfolios/all-portfolios.component';
import { PortfoliosCarouselComponent } from "./portfolios-carousel/portfolios-carousel.component";
import { PortfolioSearchBoxComponent } from "./portfolio-search-box/portfolio-search-box.component"; // Updated to FinancialPlanTileComponent

@Component({
  selector: 'app-financial',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatIconModule,
    LoadingCarouselComponent,
    SuggestedActionComponent,
    AllPortfoliosComponent,
    PortfoliosCarouselComponent,
    PortfolioSearchBoxComponent
],
  templateUrl: './financial.component.html',
  styleUrls: ['./financial.component.scss'],
})
export class FinancialComponent implements OnInit {
  startedPortfolios$!: Observable<any[]>;
  recommendedPortfolios$!: Observable<any>;
  combinedPortfolios: any[] = [];
  isLoadingCombinedPortfolios = true;
  firstIncompleteChallenge: any;
  isMobile = false;
  isTablet = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private financialProgressService: FinancialProgressService,
    private financialService: FinancialPlansService,
    private challengesService: ChallengeService,
    private breakpointObserver: BreakpointObserver,
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.breakpointObserver
        .observe([Breakpoints.XSmall, Breakpoints.Small])
        .subscribe((result) => {
          const breakpoints = result.breakpoints;
          this.isMobile = breakpoints[Breakpoints.XSmall] ? true : false;
          this.isTablet = breakpoints[Breakpoints.Small] ? true : false;
        }),
    );

    // Fetch and normalize started portfolios
    this.startedPortfolios$ = this.financialProgressService
      .getStartedPortfolios()
      .pipe(
        take(1),
        map((startedPortfolios: any[]) =>
          startedPortfolios.map((startedPortfolio) => ({
            ...startedPortfolio.portfolio,
            progress: startedPortfolio.progress,
          })),
        ),
        catchError((error) => {
          console.error('Error fetching started portfolios:', error);
          return of([]);
        }),
      );

    // Fetch recommended portfolios
    this.recommendedPortfolios$ = this.financialService
      .recommendPortfolios([], 3)
      .pipe(
        take(1),
        map((portfolios) => portfolios.data || []),
        catchError((error) => {
          console.error('Error fetching recommended portfolios:', error);
          return of([]);
        }),
      );

    // Combine started and recommended portfolios
    combineLatest([this.startedPortfolios$, this.recommendedPortfolios$])
      .pipe(
        map(([startedPortfolios, recommendedPortfolios]) => {
          this.isLoadingCombinedPortfolios = false;
          return [...startedPortfolios, ...recommendedPortfolios];
        }),
        finalize(() => {
          this.isLoadingCombinedPortfolios = false;
        }),
      )
      .subscribe((combinedPortfolios) => {
        this.combinedPortfolios = combinedPortfolios;
      });

    // Fetch first incomplete challenge of type "physical"
    this.loadFirstIncompleteChallenge();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  private async loadFirstIncompleteChallenge() {
    try {
      this.firstIncompleteChallenge =
        await this.challengesService.getFirstIncompleteChallengeByType(
          'physical',
        );
    } catch (error) {
      console.error('Error loading first incomplete challenge:', error);
    }
  }

  completePortfolio() {
    console.log('Complete Portfolio action triggered');
    // Add your logic here for completing the portfolio
  }
}
