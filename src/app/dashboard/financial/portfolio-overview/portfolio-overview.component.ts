/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { FinancialPlansService } from '@services/financial.service';
import { selectStartedPortfolio } from '@store/started-portfolio/started-portfolio.selectors';
import {
  catchError,
  finalize,
  map,
  Observable,
  of,
  Subscription,
  take,
} from 'rxjs';
import { LoadingCarouselComponent } from '../../../components/loading-carousel/loading-carousel.component';
import { PortfoliosCarouselComponent } from '../portfolios-carousel/portfolios-carousel.component';
import { PortfolioHoldingsComponent } from './portfolio-holdings/portfolio-holdings.component';
import { PortfolioIntroComponent } from './portfolio-intro/portfolio-intro.component';
import { PortfolioStatsComponent } from './portfolio-stats/portfolio-stats.component';

@Component({
  selector: 'app-portfolio-overview',
  standalone: true,
  imports: [
    PortfolioHoldingsComponent,
    LoadingCarouselComponent,
    CommonModule,
    PortfoliosCarouselComponent,
    MatIconModule,
    MatButtonModule,
    PortfolioStatsComponent,
    PortfolioIntroComponent,
  ],
  templateUrl: './portfolio-overview.component.html',
  styleUrl: './portfolio-overview.component.scss',
})
export class PortfolioOverviewComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = []; // Array to store subscriptions

  portfolio: any;
  recommendedPortfolios: any[] = [];
  isLoadingRecommendedPortfolios = true;
  startedPortfolio$: Observable<any | null> | undefined; // Observable to get the started portfolio
  isMobile = false;
  isTablet = false;

  constructor(
    private route: ActivatedRoute,
    private portfoliosService: FinancialPlansService,
    private store: Store,
    private router: Router,
    private breakpointObserver: BreakpointObserver,
  ) {}

  ngOnInit(): void {
    // Initialize startedPortfolio$ observable from the store
    this.startedPortfolio$ = this.store.select(selectStartedPortfolio);
    this.portfolio = this.route.snapshot.data['portfolio'];
    this.subscriptions.push(
      this.breakpointObserver
        .observe([Breakpoints.XSmall, Breakpoints.Small])
        .subscribe((result) => {
          const breakpoints = result.breakpoints;
          this.isMobile = !!breakpoints[Breakpoints.XSmall];
          this.isTablet = !!breakpoints[Breakpoints.Small];
        }),
    );
    this.loadRecommendedPortfolios();
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  loadRecommendedPortfolios(): void {
    this.subscriptions.push(
      this.portfoliosService
        .recommendPortfolios(this.portfolio.tags, 3)
        .pipe(
          take(1),
          map((response) => {
            this.recommendedPortfolios = response.data || [];
            this.isLoadingRecommendedPortfolios = false;
          }),
          catchError((error) => {
            console.error('Error fetching recommended portfolios:', error);
            this.isLoadingRecommendedPortfolios = false;
            return of([]);
          }),
          finalize(() => {
            this.isLoadingRecommendedPortfolios = false;
          }),
        )
        .subscribe(),
    );
  }

  navigateToBreadcrumb(destination: string): void {
    switch (destination) {
      case 'home':
        this.router.navigate(['dashboard']);
        break;
      case 'investmentHub':
        this.router.navigate(['dashboard/financial']);
        break;
      default:
        console.warn('Unrecognized breadcrumb destination:', destination);
    }
  }
}
