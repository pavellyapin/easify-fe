/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { EasifyService } from '@services/easify.service';
import { FinancialProgressService } from '@services/financial-progress.service';
import { FinancialPlansService } from '@services/financial.service';
import * as StartedPortfolioActions from '@store/started-portfolio/started-portfolio.actions';
import {
  selectEasifyPortfolioResponses,
  selectStartedPortfolio,
} from '@store/started-portfolio/started-portfolio.selectors';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import {
  SlickCarouselComponent,
  SlickCarouselModule,
} from 'ngx-slick-carousel';
import { combineLatest, map, Subscription } from 'rxjs';
import { TopicLoaderComponent } from '../../../../components/topic-loader/topic-loader.component';

@Component({
  selector: 'app-portfolio-breakdown-content',
  standalone: true,
  imports: [
    CommonModule,
    SlickCarouselModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatChipsModule,
    TopicLoaderComponent,
    NgxChartsModule,
  ],
  templateUrl: './portfolio-breakdown-content.component.html',
  styleUrl: './portfolio-breakdown-content.component.scss',
})
export class PortfolioBreakdownContentComponent implements OnDestroy, OnInit {
  private subscriptions: Subscription[] = [];

  portfolio: any;
  portfolioId: any;
  startedPortfolio: any;
  assetClass: any;
  assetClassComplete: any;
  assetClassName: any;
  holding: any;
  currentIndex = 0;
  initLoading = false;
  graphData: any;
  chartView: [number, number] = [300, 200]; // Default size
  customColors = [{ name: 'Total Portfolio Value', value: '#56c98a' }];
  xAxisTicks: any;
  slideConfig = {
    slidesToShow: 1,
    slidesToScroll: 1,
    vertical: true,
    verticalSwiping: false,
    infinite: false,
  };

  @ViewChild('slickModal') slickModal!: SlickCarouselComponent;
  @ViewChild('chartContainer', { static: false }) chartContainer:
    | ElementRef
    | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private portfolioProgressService: FinancialProgressService,
    private easifyService: EasifyService,
    private store: Store,
    public financialService: FinancialPlansService,
    private breakpointObserver: BreakpointObserver,
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.store
        .select(selectStartedPortfolio)
        .subscribe((startedPortfolio) => {
          this.startedPortfolio = startedPortfolio;
        }),
    );
    this.subscriptions.push(
      combineLatest([
        this.store.select(selectEasifyPortfolioResponses),
        this.route.paramMap,
        this.route.parent?.paramMap || [],
      ])
        .pipe(
          map(([responses, params, parentParams]) => {
            this.initLoading = true;

            this.portfolioId = parentParams.get('id');
            this.assetClassName = params.get('assetClass');
            this.currentIndex = parseInt(params.get('holding') || '0', 10);

            const parentData = this.route.parent?.snapshot.data;
            if (parentData) {
              this.portfolio = parentData['portfolio'];
            }

            if (!this.portfolio) {
              console.error('Portfolio breakdown data is not available!');
              return;
            }

            this.assetClass = this.portfolio[this.assetClassName] || [];

            // Update `hasResponse` for Easify AI integration
            this.assetClass = this.assetClass.map(
              (point: any, index: number) => ({
                ...point,
                hasResponse: responses.some(
                  (response: any) =>
                    response.itemId === this.portfolioId &&
                    response.request.item.assetClass === this.assetClassName &&
                    response.request.item.holdingIndex === index,
                ),
              }),
            );
            // Check access and evaluate progress

            this.checkAccess(this.assetClassName);

            this.handleGraphData();

            setTimeout(() => {
              if (this.slickModal) {
                this.slickModal.slickGoTo(this.currentIndex);
              }
            }, 300);
          }),
        )
        .subscribe(),
    );
  }

  handleGraphData() {
    this.graphData = this.financialService.prepareHoldingData(
      this.portfolio[this.assetClassName][this.currentIndex].historicalData,
    );
    this.setXAxisTicks();
    this.setupResponsiveChart();
  }

  setXAxisTicks() {
    if (!this.graphData?.length || !this.graphData[0]?.series?.length) return;

    const series = this.graphData[0].series;
    const firstTick = series[0]?.name;
    const lastTick = series[series.length - 1]?.name;

    let middleTick = '';
    if (series.length > 2) {
      const middleIndex = Math.floor(series.length / 2);
      middleTick = series[middleIndex]?.name;
    }

    this.xAxisTicks = middleTick
      ? [firstTick, middleTick, lastTick]
      : [firstTick, lastTick];
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.updateChartSize();
    }, 1000); // Ensure DOM is ready before measuring
  }

  setupResponsiveChart(): void {
    this.subscriptions.push(
      this.breakpointObserver
        .observe([
          Breakpoints.XSmall,
          Breakpoints.Small,
          Breakpoints.Medium,
          Breakpoints.Large,
          Breakpoints.XLarge,
        ])
        .subscribe(() => {
          this.updateChartSize();
        }),
    );
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.updateChartSize();
  }

  private updateChartSize(): void {
    if (!this.chartContainer?.nativeElement) return;

    const containerWidth = this.chartContainer.nativeElement.clientWidth;

    let width = containerWidth - 30; // Subtract padding
    let height = width * 0.3; // Maintain aspect ratio

    // Ensure a minimum size for usability
    width = Math.max(width, 250);
    height = Math.max(height, 150);

    this.chartView = [width, height];
  }

  goToPreviousSlide(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.slickModal.slickPrev();
      this.handleGraphData();
    } else {
      this.navigatePrevious();
    }
  }

  goToNextSlide(): void {
    if (this.currentIndex === this.assetClass.length - 1) {
      setTimeout(() => {
        this.navigateNext();
      }, 300);
      return;
    }
    this.currentIndex++;
    this.slickModal.slickNext();
    this.handleGraphData();

    const isLastSlide = this.currentIndex === this.assetClass.length - 1;
    const isOnlySlide = this.assetClass.length === 1;

    if (isOnlySlide || isLastSlide) {
      console.log(
        'Updating holding and asset class progress before moving to next section.',
      );

      this.updateAssetClassProgress();

      // Small delay to ensure updates are processed
    } else {
      this.slickModal.slickNext();
    }
  }

  navigatePrevious(): void {
    if (!this.startedPortfolio?.progress?.assetClass) {
      console.error('Portfolio progress data is missing.');
      return;
    }

    const assetClasses = this.startedPortfolio.progress.assetClass.map(
      (a: any) => a.name,
    );
    const currentAssetClassIndex = assetClasses.indexOf(this.assetClassName);

    if (currentAssetClassIndex === -1) {
      console.error(
        `Current asset class ${this.assetClassName} not found in progress.`,
      );
      return;
    }

    // If at the first holding, check if there is a previous asset class
    const previousAssetClassIndex = currentAssetClassIndex - 1;

    if (previousAssetClassIndex >= 0) {
      const previousAssetClass = assetClasses[previousAssetClassIndex];
      const previousHoldings = this.portfolio[previousAssetClass] || [];
      const lastHoldingIndex = previousHoldings.length - 1;

      console.log(
        `Navigating to previous asset class: ${previousAssetClass}, last holding: ${lastHoldingIndex}`,
      );

      this.router.navigate([
        `dashboard/portfolio/${this.portfolioId}/breakdown/${previousAssetClass}/${lastHoldingIndex}`,
      ]);
      return;
    }

    // If at the first asset class, navigate to breakdown
    console.log('Reached the first asset class, navigating to breakdown.');
    this.router.navigate([`dashboard/portfolio/${this.portfolioId}/overview`]);
  }

  navigateNext(): void {
    if (!this.startedPortfolio?.progress?.assetClass) {
      console.error('Portfolio progress data is missing.');
      return;
    }

    const assetClasses = this.startedPortfolio.progress.assetClass.map(
      (a: any) => a.name,
    );
    const currentAssetClassIndex = assetClasses.indexOf(this.assetClassName);

    if (currentAssetClassIndex === -1) {
      console.error(
        `Current asset class ${this.assetClassName} not found in progress.`,
      );
      return;
    }

    // If this is the last holding, move to the next asset class
    const nextAssetClassIndex = currentAssetClassIndex + 1;

    if (nextAssetClassIndex < assetClasses.length) {
      const nextAssetClass = assetClasses[nextAssetClassIndex];
      console.log(`Navigating to next asset class: ${nextAssetClass}`);
      this.router.navigate([
        `dashboard/portfolio/${this.portfolioId}/breakdown/${nextAssetClass}/0`,
      ]);
    } else {
      // If at the last asset class, navigate to breakdown
      console.log('Reached last asset class, navigating to breakdown.');
      this.router.navigate([
        `dashboard/portfolio/${this.portfolioId}/overview`,
      ]);
    }
  }

  expandPoint(pointIndex: number): void {
    const point = this.assetClass[pointIndex];

    if (point.hasResponse) {
      this.initLoading = true;
      setTimeout(() => {
        this.initLoading = false;
        this.router.navigate([
          `dashboard/portfolio/${this.portfolioId}/breakdown/${this.assetClassName}/${pointIndex}/easify`,
        ]);
      }, 3000);
    } else {
      this.initLoading = true;
      const request = {
        type: 'portfolio',
        item: {
          id: this.portfolioId,
          assetClass: this.assetClassName,
          holdingIndex: pointIndex,
        },
      };

      this.easifyService.expandContent(request).subscribe({
        next: async (response) => {
          console.log('Expanded content:', response);
          const responses =
            await this.portfolioProgressService.getEasifyResponsesByItemId(
              this.portfolioId,
            );
          this.store.dispatch(
            StartedPortfolioActions.loadPortfolioEasifyResponsesSuccess({
              responses,
            }),
          );
          this.router.navigate([
            `dashboard/portfolio/${this.portfolioId}/breakdown/${this.assetClassName}/${pointIndex}/easify`,
          ]);
        },
        error: (error) => {
          console.error('Error expanding content:', error);
          this.initLoading = false;
        },
      });
    }
  }

  public checkAccess(assetClassName: string): void {
    if (!this.startedPortfolio?.progress?.assetClass) {
      console.error('Portfolio progress is missing asset classes.');
      return;
    }

    // Find progress entry for the requested asset class
    const assetClassProgress = this.startedPortfolio.progress.assetClass.find(
      (progress: any) => progress.name === assetClassName,
    );

    if (!assetClassProgress) {
      console.warn(
        `No progress entry found for asset class: ${assetClassName}`,
      );
      return;
    }
    this.assetClassComplete = assetClassProgress.complete;
    if (this.assetClassComplete) {
      this.evaluateProgress(assetClassName);
      return;
    }

    // Check if the asset class has only one holding
    const holdings = this.portfolio[assetClassName] || [];
    const isSingleHolding = holdings.length === 1;

    if (isSingleHolding && !this.assetClassComplete) {
      console.log(
        `Only one holding in ${assetClassName}. Marking as complete.`,
      );
      this.updateAssetClassProgress();
      return;
    }

    // Find the first incomplete asset class
    const firstIncomplete = this.startedPortfolio.progress.assetClass.find(
      (asset: any) => !asset.complete,
    );

    // If no incomplete asset class exists, evaluate progress and allow access
    if (!firstIncomplete) {
      console.log(
        `All asset classes are complete. Proceeding with ${assetClassName}`,
      );
      this.evaluateProgress(assetClassName);
      return;
    }

    console.log(`First incomplete asset class: ${firstIncomplete.name}`);

    // If the current asset class is already the first incomplete one, don't redirect
    if (firstIncomplete.name === assetClassName) {
      console.log(
        `User is on the correct asset class: ${assetClassName}. Evaluating progress.`,
      );
      this.evaluateProgress(assetClassName);
      return;
    }

    // Redirect user to the first incomplete asset class
    console.warn(
      `Redirecting to first incomplete asset class: ${firstIncomplete.name}`,
    );
    this.router.navigate([
      `dashboard/portfolio/${this.portfolioId}/breakdown/${firstIncomplete.name}/0`,
    ]);
  }
  private evaluateProgress(assetClassName: string): void {
    // Find progress for the requested asset class
    const assetClassProgress = this.startedPortfolio.progress.assetClass.find(
      (progress: any) => progress.name === assetClassName,
    );

    if (!assetClassProgress) {
      console.warn(
        `No progress entry found for asset class: ${assetClassName}`,
      );
      return;
    }

    const { complete } = assetClassProgress;

    this.assetClassComplete = complete;

    setTimeout(() => {
      this.initLoading = false;
    }, 300);
  }

  private async updatePortfolioProgress(): Promise<void> {
    try {
      // Clone current progress to avoid direct mutations
      const updatedProgress = [...this.startedPortfolio.progress.assetClass];

      // Find and update only the matching asset class
      const assetClassIndex = updatedProgress.findIndex(
        (asset) => asset.name === this.assetClassName,
      );

      if (assetClassIndex === -1) {
        console.warn(
          `Asset class ${this.assetClassName} not found in progress.`,
        );
        this.initLoading = false;
        return;
      }

      updatedProgress[assetClassIndex] = {
        ...updatedProgress[assetClassIndex],
        complete: true, // Only update the complete attribute
      };

      const progress =
        ((this.startedPortfolio.progress.completeTickers +
          this.assetClass.length) /
          this.startedPortfolio.progress.totalTickers) *
        100;

      await this.portfolioProgressService.updatePortfolioProgress(
        this.portfolioId,
        {
          assetClass: updatedProgress,
          completeTickers:
            this.startedPortfolio.progress.completeTickers +
            this.assetClass.length,
          totalTickers: this.startedPortfolio.progress.totalTickers,
          progress,
        },
      );

      console.log(
        `Progress updated successfully for asset class: ${this.assetClassName}`,
      );

      const startedPortfolio =
        await this.portfolioProgressService.getStartedPortfolioById(
          this.portfolioId,
        );
      this.store.dispatch(
        StartedPortfolioActions.loadStartedPortfolioSuccess({
          startedPortfolio,
        }),
      );

      this.assetClassComplete = true;
      this.initLoading = false;
    } catch (error) {
      console.error('Error updating portfolio progress:', error);
      this.initLoading = false;
    }
  }

  updateAssetClassProgress(): void {
    if (!this.assetClassComplete) {
      this.updatePortfolioProgress();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }
}
