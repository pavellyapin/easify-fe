/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { EasifyResponseContentComponent } from '@components/easify-response-content/easify-response-content.component';
import { Store } from '@ngrx/store';
import { TimeUtilsAndMore } from '@services/time.utils';
import { selectEasifyIndustryResponses } from '@store/started-growth/started-growth.selectors';
import { combineLatest, filter, map, Subscription } from 'rxjs';

@Component({
  selector: 'app-industry-breakdown-easify',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    EasifyResponseContentComponent,
  ],
  templateUrl: './industry-breakdown-easify.component.html',
  styleUrl: './industry-breakdown-easify.component.scss',
})
export class IndustryBreakdownEasifyComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = []; // Array to store subscriptions
  easifyResponse: any;
  industryId!: string;
  part!: any;
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
        this.store.select(selectEasifyIndustryResponses),
        this.route.paramMap,
        this.route.parent?.paramMap ?? [],
        this.route.parent?.data ?? [],
      ])
        .pipe(
          filter(([responses, , , parentData]) => !!responses && !!parentData),
          map(([responses, params, parentParams, parentData]) => {
            this.industryId = parentParams.get('id')!;
            this.part = params.get('part');

            // Assign responses for the current point to easifyResponse
            this.easifyResponse = responses
              .filter(
                (response: any) =>
                  response.itemId === this.industryId &&
                  response.request.item.part.toLocaleLowerCase() ===
                    this.part.toLocaleLowerCase(),
              )
              .pop();
            // Use the recipe data from the parent route
            const industry = parentData['industry'];
            if (industry) {
              this.context = `I am going through the industry "${industry.name}".`;
            } else {
              this.context = 'industry information is not available.';
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
    this.router.navigate([`dashboard/industry/${this.industryId}/overview`]);
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }
}
