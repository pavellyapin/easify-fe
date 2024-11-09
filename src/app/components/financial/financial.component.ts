/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { FinancialPlansService } from '@services/financial.service';
import { Observable, of } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';
import { FinancialPlanTileComponent } from './financial-plan-tile/financial-plan-tile.component';
import { PlanTagsAutocompleteComponent } from './plan-tags-autocomplete/plan-tags-autocomplete.component'; // Updated to FinancialPlanTileComponent

@Component({
  selector: 'app-financial',
  standalone: true,
  imports: [
    CommonModule,
    FinancialPlanTileComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatIconModule,
    PlanTagsAutocompleteComponent,
  ],
  templateUrl: './financial.component.html',
  styleUrls: ['./financial.component.scss'],
})
export class FinancialComponent implements OnInit {
  startedPlans$!: Observable<any[]>;
  recommendedPlans$!: Observable<any>;
  allPlans$!: Observable<any>;
  isLoadingRecommended = false;
  isLoadingAll = false;
  allTags$!: Observable<string[]>; // Observable for the dropdown
  selectedTags: string[] = [];

  constructor(private financialPlansService: FinancialPlansService) {}

  ngOnInit(): void {
    this.startedPlans$ = this.financialPlansService.getStartedPlans();
    this.allTags$ = this.financialPlansService.getAllPlanTags();

    this.isLoadingAll = true;

    this.allTags$.subscribe((tags) => {
      this.selectedTags = tags.slice(0, 6); // Get the top 5 tags
      this.fetchPlansBasedOnSelectedTags();
    });

    // Fetch recommended financial plans
    this.fetchRecommendedPlans();
  }

  fetchRecommendedPlans(): void {
    this.isLoadingRecommended = true;

    this.recommendedPlans$ = this.startedPlans$.pipe(
      switchMap((startedPlans) => {
        // Extract IDs and tags from started plans
        const startedPlanIds = startedPlans.map((plan) => plan.plan.id);
        const tags = startedPlans.reduce((acc: string[], plan: any) => {
          return acc.concat(plan.plan.tags || []);
        }, []);

        return this.financialPlansService
          .recommendPlans([...new Set(tags.slice(0, 30))], 5)
          .pipe(
            map((recommendedPlans) =>
              // Filter out the plans that have already been started
              recommendedPlans.data.filter(
                (plan: any) => !startedPlanIds.includes(plan.id),
              ),
            ),
            catchError((error) => {
              console.error('Error fetching recommended plans:', error);
              return of([]); // Return an empty array in case of error
            }),
            finalize(() => {
              this.isLoadingRecommended = false; // Reset loading state
            }),
          );
      }),
    );
  }

  fetchPlansBasedOnSelectedTags(): void {
    this.isLoadingAll = true;

    if (this.selectedTags.length > 0) {
      this.allPlans$ = this.financialPlansService
        .recommendPlans(this.selectedTags, 20)
        .pipe(
          catchError((error) => {
            console.error('Error fetching plans:', error);
            return of([]); // Return an empty array in case of error
          }),
          finalize(() => {
            this.isLoadingAll = false; // Reset loading state
          }),
        );
    } else {
      this.allPlans$ = this.financialPlansService.getAllPlans();
    }
  }

  onTagSelected(tag: string): void {
    if (!this.selectedTags.includes(tag)) {
      this.selectedTags.push(tag);
      this.fetchPlansBasedOnSelectedTags();
    }
  }

  removeTag(tag: string): void {
    const index = this.selectedTags.indexOf(tag);
    if (index >= 0) {
      this.selectedTags.splice(index, 1);
      this.fetchPlansBasedOnSelectedTags();
    }
  }
}
