/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { SuggestedActionComponent } from '@components/suggested-action/suggested-action.component';
import { CapitalizePipe } from '@services/capitalize.pipe';
import { TimeUtilsAndMore } from '@services/time.utils';

@Component({
  selector: 'app-portfolio-stats',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    SuggestedActionComponent,
    CapitalizePipe,
    MatProgressBarModule,
  ],
  templateUrl: './portfolio-stats.component.html',
  styleUrl: './portfolio-stats.component.scss',
})
export class PortfolioStatsComponent implements OnInit {
  @Input() portfolio: any;
  @Input() startedPortfolio: any;
  @Input() isMobile = false;
  @Input() isTablet = false;

  holdingsCount = 0;
  riskLevel = '';
  timeSpan: any;

  constructor(
    private router: Router,
    private timeUtils: TimeUtilsAndMore,
  ) {}

  ngOnInit(): void {
    if (this.portfolio) {
      this.calculateStats();
    }
  }

  calculateStats(): void {
    this.holdingsCount = this.portfolio?.holdings.length || 0;
    this.riskLevel = this.portfolio?.riskLevel || 'unknown';

    // Calculate time span
    if (this.portfolio.portfolioValues?.length) {
      const sortedValues = [...this.portfolio.portfolioValues].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );

      const startDate = new Date(sortedValues[0].date);
      const endDate = new Date(sortedValues[sortedValues.length - 1].date);
      this.timeSpan = this.timeUtils.getFriendlyTimeSpan(startDate, endDate);
    } else {
      this.timeSpan = 'No data';
    }
  }

  public initializeOrUpdateProgress() {
    this.navigateToPortfolio();
  }

  navigateToPortfolio(): void {
    if (!this.startedPortfolio?.progress?.assetClass?.length) {
      console.warn(
        'No started portfolio progress found, navigating to default portfolio view.',
      );
      this.router.navigate([
        'dashboard/portfolio',
        this.startedPortfolio.portfolio.id,
        'breakdown',
      ]);
      return;
    }

    const assetClasses = this.startedPortfolio.progress.assetClass;

    // Find the first incomplete asset class
    const firstIncomplete =
      assetClasses.find((asset: any) => !asset.complete) || assetClasses[0];

    console.log(
      `Navigating to first incomplete asset class: ${firstIncomplete.name}, starting from first holding.`,
    );

    this.router.navigate([
      'dashboard/portfolio',
      this.startedPortfolio.portfolio.id,
      'breakdown',
      firstIncomplete.name,
      '0', // Start at first holding
    ]);
  }

  getRiskLevelIcons(riskLevel: string): string {
    if (riskLevel.toLowerCase() === 'low') {
      return 'beginner';
    } else if (riskLevel.toLowerCase() === 'moderate') {
      return 'intermediate';
    } else {
      return 'advanced';
    }
  }

  completeModule() {
    console.log('Portfolio Module Completed');
  }
}
