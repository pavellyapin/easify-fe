/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { EasifyResponseContentComponent } from '@components/easify-response-content/easify-response-content.component';
import { Store } from '@ngrx/store';
import { TimeUtilsAndMore } from '@services/time.utils';
import { selectEasifyPortfolioResponses } from '@store/started-portfolio/started-portfolio.selectors';
import { combineLatest, filter, map, Subscription } from 'rxjs';

@Component({
  selector: 'app-portfolio-breakdown-easify',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    EasifyResponseContentComponent,
  ],
  templateUrl: './portfolio-breakdown-easify.component.html',
  styleUrl: './portfolio-breakdown-easify.component.scss',
})
export class PortfolioBreakdownEasifyComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = []; // Array to store subscriptions
  easifyResponse: any;
  portfolioId!: string;
  assetClassName!: any;
  holdingIndex!: number;
  context: any;

  constructor(
    private route: ActivatedRoute,
    private store: Store,
    public utils: TimeUtilsAndMore,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      combineLatest([
        this.store.select(selectEasifyPortfolioResponses),
        this.route.paramMap,
        this.route.parent?.paramMap ?? [],
        this.route.parent?.data ?? [],
      ])
        .pipe(
          filter(([responses, , , parentData]) => !!responses && !!parentData),
          map(([responses, params, parentParams, parentData]) => {
            this.portfolioId = parentParams.get('id')!;
            this.assetClassName = params.get('assetClass');
            this.holdingIndex = parseInt(params.get('holding') ?? '0', 10);

            // Assign responses for the current point to easifyResponse
            this.easifyResponse = responses
              .filter(
                (response: any) =>
                  response.itemId === this.portfolioId &&
                  response.request.item.assetClass === this.assetClassName &&
                  response.request.item.holdingIndex === this.holdingIndex,
              )
              .pop();
            // Use the recipe data from the parent route
            const portfolio = parentData['portfolio'];
            if (portfolio) {
              this.context = `I am going through the portfolio "${portfolio.name}".`;
            } else {
              this.context = 'portfolio information is not available.';
            }
          }),
        )
        .subscribe(),
    );
  }

  /**
   * Navigates back to the topic route with the pointIndex as route data.
   */
  goBack(): void {
    this.router.navigate([
      `dashboard/portfolio/${this.portfolioId}/breakdown/${this.assetClassName}/${this.holdingIndex}`,
    ]);
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }
}
