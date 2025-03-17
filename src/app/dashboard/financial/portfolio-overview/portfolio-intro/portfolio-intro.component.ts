/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CapitalizePipe } from '@services/capitalize.pipe';
import { FinancialPlansService } from '@services/financial.service';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-portfolio-intro',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    CapitalizePipe,
    MatProgressBarModule,
    NgxChartsModule,
  ],
  templateUrl: './portfolio-intro.component.html',
  styleUrl: './portfolio-intro.component.scss',
})
export class PortfolioIntroComponent implements OnInit, AfterViewInit {
  @Input() portfolio: any;
  @Input() isMobile = false;
  @Input() isTablet = false;
  @Input() startedPortfolio: any;
  portfolioValue: any;
  differenceInDollars: any;
  differenceInPercent: any;
  graphData: any;
  chartView: [number, number] = [300, 200]; // Default size
  customColors = [{ name: 'Total Portfolio Value', value: '#56c98a' }];
  xAxisTicks: any;
  // ✅ Define asset classes
  assetClasses = [
    'usEquitiesValue',
    'internationalEquitiesValue',
    'emergingMarketEquitiesValue',
    'globalEquitiesValue',
    'bondsValue',
    'goldValue',
    'cryptoValue',
  ];

  @ViewChild('chartContainer', { static: false }) chartContainer:
    | ElementRef
    | undefined;
  private subscriptions: Subscription[] = [];

  constructor(
    public financialService: FinancialPlansService,
    private breakpointObserver: BreakpointObserver,
  ) {}

  ngOnInit() {
    this.graphData = this.financialService.prepareProgressData(
      this.portfolio.portfolioValues,
    );
    this.calculateInvestmentStats();
    this.setXAxisTicks();
    this.setupResponsiveChart();
  }

  calculateInvestmentStats(): void {
    if (!this.portfolio?.portfolioValues?.length) {
      console.warn('No portfolio values found.');
      this.portfolioValue = 0;
      this.differenceInDollars = 0;
      this.differenceInPercent = 0;
      return;
    }

    // Sort values by date (just in case)
    const sortedValues = [...this.portfolio.portfolioValues].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    // Get the first recorded portfolio value (initial investment)
    const initialInvestment = sortedValues[0].totalValue ?? 0;

    // Get the most recent portfolio value
    this.portfolioValue = sortedValues[sortedValues.length - 1].totalValue ?? 0;

    // Calculate the difference in dollars
    this.differenceInDollars = this.portfolioValue - initialInvestment;

    // Calculate the percentage difference
    this.differenceInPercent =
      initialInvestment > 0
        ? (this.differenceInDollars / initialInvestment) * 100
        : 0;
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
    }, 100); // Ensure DOM is ready before measuring
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

  getRemainingPercentage(): number {
    return Math.round(100 - (this.startedPortfolio?.progress?.progress || 0));
  }
}
