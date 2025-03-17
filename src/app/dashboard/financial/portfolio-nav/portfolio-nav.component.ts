/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { LoadingNavComponent } from '@components/loading-nav/loading-nav.component';
import { FinancialPlansService } from '@services/financial.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-portfolio-nav',
  standalone: true,
  imports: [CommonModule, MatIconModule, LoadingNavComponent, MatChipsModule],
  templateUrl: './portfolio-nav.component.html',
  styleUrl: './portfolio-nav.component.scss',
})
export class PortfolioNavComponent implements OnInit, OnDestroy {
  @Input() portfolio: any;
  @Input() loading: any = false;
  @Input() startedPortfolio: any;
  currentAssetClassIndex: number | null = null;
  private subscriptions: Subscription[] = []; // Array to store subscriptions

  constructor(
    private route: ActivatedRoute,
    public financialService: FinancialPlansService,
  ) {}

  ngOnInit(): void {
    // Subscribe to route parameters and add to subscriptions
    const routeSub = this.route.paramMap.subscribe((params) => {
      const exercise = parseInt(params.get('portfolio')!, 10) - 1; // Convert to 0-based index
      this.currentAssetClassIndex = exercise;
    });
    this.subscriptions.push(routeSub);
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
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
}
