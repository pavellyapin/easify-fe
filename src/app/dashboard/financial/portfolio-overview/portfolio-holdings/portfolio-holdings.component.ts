/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { FinancialPlansService } from '@services/financial.service';
import { CapitalizePipe } from '../../../../services/capitalize.pipe';

@Component({
  selector: 'app-portfolio-holdings',
  standalone: true,
  imports: [
    CommonModule,
    MatExpansionModule,
    MatIconModule,
    MatButtonModule,
    CapitalizePipe,
    MatChipsModule,
    MatTableModule,
    MatProgressBarModule,
  ],
  templateUrl: './portfolio-holdings.component.html',
  styleUrl: './portfolio-holdings.component.scss',
})
export class PortfolioHoldingsComponent implements OnInit {
  @Input() portfolio: any;
  @Input() startedPortfolio: any;
  @Input() isMobile = false;
  @Input() isTablet = false;
  computedAllocations: { assetClass: string; percentage: number }[] = [];

  constructor(
    private router: Router,
    public financialService: FinancialPlansService,
  ) {}

  private assetClassMapping: Record<string, string> = {
    govBonds: 'bondsValue',
    usEquities: 'usEquitiesValue',
    internationalEquities: 'internationalEquitiesValue',
    emergingMarketEquities: 'emergingMarketEquitiesValue',
    globalEquities: 'globalEquitiesValue',
    gold: 'goldValue',
    cryptocurrencies: 'cryptoValue',
  };

  getAssetClassColor(assetClass: string): string {
    const colorMap: Record<string, string> = {
      usEquities: '#8cdcb7',
      internationalEquities: '#1e6746',
      emergingMarketEquities: '#1aff2d',
      globalEquities: '#3ca4e1',
      govBonds: '#b2ffc3',
      gold: '#b4dcf4',
      cryptocurrencies: '#607D8B',
    };
    return colorMap[assetClass] || '#BDBDBD'; // Default gray if not found
  }

  ngOnInit() {
    this.computeAllocations();
  }

  private computeAllocations(): void {
    if (!this.portfolio?.portfolioValues?.length) return;

    const lastPortfolioValue =
      this.portfolio.portfolioValues[this.portfolio.portfolioValues.length - 1];
    const totalValue = lastPortfolioValue.totalValue || 1; // Prevent division by zero

    this.computedAllocations = Object.keys(this.assetClassMapping)
      .map((assetClass) => {
        const mappedKey = this.assetClassMapping[assetClass] || assetClass;
        const assetValue = lastPortfolioValue[mappedKey] || 0;
        const percentage = (assetValue / totalValue) * 100;

        return { assetClass, percentage };
      })
      .filter((item) => item.percentage > 0) // Remove zero allocation classes
      .sort((a, b) => b.percentage - a.percentage); // ✅ Sort from highest to lowest percentage
  }

  get assetClasses(): string[] {
    return this.portfolio?.allocations
      ? Object.keys(this.portfolio.allocations)
      : [];
  }

  getMarketValue(asset: any): number {
    if (!asset.historicalData || asset.historicalData.length === 0) return 0;

    // ✅ Get last historical entry for market value
    const lastEntry = asset.historicalData[asset.historicalData.length - 1];
    return lastEntry.value || 0;
  }

  getPerformance(asset: any): number {
    if (!asset.historicalData || asset.historicalData.length < 2) return 0;

    // ✅ Get first and last historical data entries
    const firstEntry = asset.historicalData[0];
    const lastEntry = asset.historicalData[asset.historicalData.length - 1];

    // ✅ Calculate performance percentage
    return (lastEntry.close - firstEntry.close) / firstEntry.close;
  }

  getPerformanceClass(asset: any): string {
    const performance = this.getPerformance(asset);
    return performance >= 0 ? 'positive-performance' : 'negative-performance';
  }

  getAssetClassIcon(assetClass: string, index: number): string {
    if (!this.startedPortfolio?.progress?.assetClass) {
      console.warn('Portfolio progress data is missing.');
      return 'more-horiz'; // Default if progress is missing
    }

    // Find current asset class in progress array
    const assetProgress = this.startedPortfolio.progress.assetClass.find(
      (progress: any) => progress.name === assetClass,
    );

    // Find previous asset class in progress array
    const previousAssetClass =
      index > 0 ? this.startedPortfolio.progress.assetClass[index - 1] : null;

    const isComplete = assetProgress?.complete ?? false;
    const previousComplete = previousAssetClass?.complete ?? true; // Default to true for the first asset class

    if (isComplete) {
      return 'check-round'; // ✅ Completed
    } else if (!isComplete && previousComplete) {
      return 'progress'; // 🔄 In progress if previous is complete
    } else if (index === 0 && !isComplete) {
      return 'progress'; // 🔄 First asset class should be in progress
    }

    return 'more-horiz'; // ⏳ Not started yet
  }

  getFirstIncompleteAssetClassIndex(): number {
    if (!this.startedPortfolio?.progress?.assetClass?.length) {
      console.warn('No asset class progress data found.');
      return 0; // Default to first index
    }

    const assetProgress = this.startedPortfolio.progress.assetClass;

    const firstIncompleteIndex = assetProgress.findIndex(
      (progress: any) => !progress.complete,
    );

    return firstIncompleteIndex !== -1 ? firstIncompleteIndex : 0;
  }

  navigateToAssetClass(assetClass: string): void {
    this.router.navigate([
      `dashboard/portfolio/${this.startedPortfolio.portfolio.id}/breakdown/${assetClass}/0`,
    ]);
  }

  navigateToAssetClassHolding(assetClass: string, holdingIndex: number): void {
    this.router.navigate([
      `dashboard/portfolio/${this.startedPortfolio.portfolio.id}/breakdown/${assetClass}/${holdingIndex}`,
    ]);
  }
}
