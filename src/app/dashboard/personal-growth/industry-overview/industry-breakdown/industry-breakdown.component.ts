/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { EasifyService } from '@services/easify.service';
import { GrowthProgressService } from '@services/growth-progress.service';
import { IndustryBreakdownSections } from '@store/growth/growth.model';
import { loadIndustryEasifyResponsesSuccess } from '@store/started-growth/started-growth.actions';
import { selectEasifyIndustryResponses } from '@store/started-growth/started-growth.selectors';
import { Subscription, combineLatest, map } from 'rxjs';

@Component({
  selector: 'app-industry-breakdown',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatChipsModule,
  ],
  templateUrl: './industry-breakdown.component.html',
  styleUrl: './industry-breakdown.component.scss',
})
export class IndustryBreakdownComponent {
  @Input() industry: any;
  industryId: any;
  initLoading = false;
  industrySections: any;
  industryBreakdownSections = IndustryBreakdownSections;

  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private growthProgress: GrowthProgressService,
    private easifyService: EasifyService,
    private store: Store,
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      combineLatest([
        this.store.select(selectEasifyIndustryResponses),
        this.route.paramMap,
      ])
        .pipe(
          map(([responses, parentParams]) => {
            this.initLoading = true;
            this.industryId = parentParams.get('id');
            // Loop through all enum values and check if a response exists for each section
            this.industrySections = Object.values(
              IndustryBreakdownSections,
            ).map((section) => ({
              section,
              hasResponse: responses.some(
                (response: any) =>
                  response.itemId === this.industryId &&
                  response.request.item.part === section,
              ),
            }));
          }),
        )
        .subscribe(() => {
          this.initLoading = false;
        }),
    );
  }
  hasResponseForSection(part: IndustryBreakdownSections): boolean {
    return this.industrySections.some(
      (section: any) => section.section === part && section.hasResponse,
    );
  }

  expandPoint(part: IndustryBreakdownSections): void {
    const section = this.industrySections.find((s: any) => s.section === part);

    if (section?.hasResponse) {
      this.initLoading = true;
      setTimeout(() => {
        this.initLoading = false;
        this.router.navigate([
          `dashboard/industry/${this.industryId}/overview/${part.toLocaleLowerCase()}/easify`,
        ]);
      }, 3000);
    } else {
      this.initLoading = true;
      const request = {
        type: 'industry',
        item: {
          id: this.industryId,
          part: part,
        },
      };

      this.easifyService.expandContent(request).subscribe({
        next: async (response) => {
          console.log('Expanded content:', response);
          const responses =
            await this.growthProgress.getEasifyResponsesByItemId(
              this.industryId,
            );
          this.store.dispatch(
            loadIndustryEasifyResponsesSuccess({
              responses,
            }),
          );
          this.router.navigate([
            `dashboard/industry/${this.industryId}/overview/${part.toLocaleLowerCase()}/easify`,
          ]);
        },
        error: (error) => {
          console.error('Error expanding content:', error);
          this.initLoading = false;
        },
      });
    }
  }
}
