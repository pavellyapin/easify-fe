/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { GrowthService } from '@services/growth.service';
import { Observable, of } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { IndustryTileComponent } from './industry-tile/industry-tile.component';

@Component({
  selector: 'app-personal-growth',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatToolbarModule,
    IndustryTileComponent,
  ],
  templateUrl: './personal-growth.component.html',
  styleUrls: ['./personal-growth.component.scss'],
})
export class PersonalGrowthComponent implements OnInit {
  startedIndustries$!: Observable<any>;
  recommendedIndustries$!: Observable<any>;
  allIndustries$!: Observable<any>;
  isLoadingRecommended = false;
  isLoadingAll = false;
  allTags$!: Observable<string[]>; // Observable for the dropdown
  selectedTags: string[] = [];

  constructor(private growthService: GrowthService) {}

  ngOnInit(): void {
    this.startedIndustries$ = this.growthService.getStartedIndustries();
    this.allTags$ = this.growthService.getAllIndustryTags();

    this.isLoadingAll = true;

    this.allTags$.subscribe((tags) => {
      this.selectedTags = tags.slice(0, 6); // Get the top 5 tags
      this.fetchIndustriesBasedOnSelectedTags();
    });

    this.fetchRecommendedIndustries(); // Call backend for recommended industries
  }

  fetchRecommendedIndustries(): void {
    this.isLoadingRecommended = true;

    this.growthService
      .recommendIndustries([], 5) // Fetch recommended industries with no specific tags
      .pipe(
        map((recommendedIndustries) => recommendedIndustries.data),
        catchError((error) => {
          console.error('Error fetching recommended industries:', error);
          return of([]); // Return an empty array in case of error
        }),
        finalize(() => {
          this.isLoadingRecommended = false; // Reset loading state
        }),
      )
      .subscribe((recommendedIndustries) => {
        this.recommendedIndustries$ = of(recommendedIndustries);
      });
  }

  fetchIndustriesBasedOnSelectedTags(): void {
    if (this.selectedTags.length > 0) {
      this.allIndustries$ = this.growthService
        .recommendIndustries(this.selectedTags, 20)
        .pipe(
          map(
            (industries) =>
              industries.data.sort(
                (a: any, b: any) => a.createdDate - b.createdDate,
              ), // Sort by createdDate
          ),
          catchError((error) => {
            console.error('Error fetching industries:', error);
            return of([]); // Return an empty array in case of error
          }),
          finalize(() => {
            this.isLoadingAll = false; // Ensure the loading state is reset
          }),
        );
    } else {
      this.allIndustries$ = this.growthService.getAllIndustries();
    }
  }

  onTagSelected(tag: string): void {
    if (!this.selectedTags.includes(tag)) {
      this.selectedTags.push(tag);
      this.fetchIndustriesBasedOnSelectedTags();
    }
  }

  removeTag(tag: string): void {
    const index = this.selectedTags.indexOf(tag);
    if (index >= 0) {
      this.selectedTags.splice(index, 1);
      this.fetchIndustriesBasedOnSelectedTags();
    }
  }
}
