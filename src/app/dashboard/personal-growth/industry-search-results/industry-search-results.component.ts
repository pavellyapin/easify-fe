/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { LoadingCarouselComponent } from '@components/loading-carousel/loading-carousel.component';
import { Store } from '@ngrx/store';
import { CapitalizePipe } from '@services/capitalize.pipe';
import { GrowthService } from '@services/growth.service';
import { setIndustriesSearchResults } from '@store/growth/growth.actions';
import { selectIndustrySearchResults } from '@store/growth/growth.selectors';
import { setDashboardLoading } from '@store/loader/loading.actions';
import { Observable } from 'rxjs';
import { IndustrySearchBoxComponent } from '../industry-search-box/industry-search-box.component';
import { IndustryTileComponent } from '../industry-tile/industry-tile.component';

@Component({
  selector: 'app-industry-search-results',
  standalone: true,
  imports: [
    CommonModule,
    LoadingCarouselComponent,
    IndustryTileComponent,
    MatIconModule,
    IndustrySearchBoxComponent,
    MatChipsModule,
    CapitalizePipe,
    MatButtonModule,
  ],
  templateUrl: './industry-search-results.component.html',
  styleUrl: './industry-search-results.component.scss',
})
export class IndustrySearchResultsComponent implements OnInit {
  searchResults$: Observable<any>;
  allIndustries: any[] = []; // Stores and emits the industry list
  relatedCategories: any[] = [];
  relatedJobTitles: any[] = [];
  keyword!: string;
  isLoadingAll = false;
  isLoadingMore = false;
  isPanelOpen = false;
  lastIndustry = false;
  industriesLimit = 20;

  constructor(
    private store: Store,
    private growthService: GrowthService,
    private router: Router,
  ) {
    this.searchResults$ = this.store.select(selectIndustrySearchResults);
  }

  ngOnInit(): void {
    this.loadInitialIndustries();
  }

  private loadInitialIndustries(): void {
    this.isLoadingAll = true;

    this.searchResults$.subscribe((industries) => {
      this.allIndustries = industries.industries.slice(0, this.industriesLimit);
      this.relatedCategories = industries.relatedCategories;
      this.relatedJobTitles = industries.relatedJobTitles;
      this.keyword = industries.keyword;
      this.lastIndustry =
        this.allIndustries.length >= industries.industries.length;
      setTimeout(() => {
        this.isLoadingAll = false;
      }, 1000); // Simulate loading timeout
    });
  }

  loadMoreIndustries(): void {
    if (this.lastIndustry) {
      this.scrollToTop();
    } else {
      this.isLoadingMore = true;
    }

    this.searchResults$.subscribe((industries) => {
      setTimeout(() => {
        const newLimit = this.industriesLimit + 20;
        this.allIndustries = industries.industries.slice(0, newLimit);
        this.industriesLimit = newLimit;
        this.lastIndustry =
          this.allIndustries.length >= industries.industries.length;
        this.isLoadingMore = false;
      }, 1000); // Simulate loading timeout
    });
  }

  onSearchKeyword(keyword: string): void {
    keyword = keyword.trim();
    if (!keyword) {
      return; // Do nothing if search is empty
    }

    // Dispatch dashboard loading state
    this.store.dispatch(setDashboardLoading({ isLoading: true }));

    // Call the search service
    this.growthService.industryKeywordSearch(keyword).subscribe(
      (results) => {
        // Save results to state
        this.store.dispatch(
          setIndustriesSearchResults({ results: results.data }),
        );

        // Turn off the loading state
        this.store.dispatch(setDashboardLoading({ isLoading: false }));

        // Navigate to the search results page
        this.router.navigate(['/dashboard/industry-search-results']);
      },
      (error) => {
        console.error('Error searching industries:', error);

        // Turn off the loading state in case of an error
        this.store.dispatch(setDashboardLoading({ isLoading: false }));
      },
    );
  }

  onExplorePopularIndustries() {
    this.router.navigate(['/dashboard/personal-growth']);
  }

  navigateToBreadcrumb(destination: string): void {
    switch (destination) {
      case 'home':
        this.router.navigate(['dashboard']);
        break;
      case 'industriesHub':
        this.router.navigate(['dashboard/personal-growth']);
        break;
      default:
        console.warn('Unrecognized breadcrumb destination:', destination);
    }
  }

  scrollToTop(): void {
    const scrollContainer = document.querySelector('.mat-drawer-content');
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: 0,
        behavior: 'smooth', // Enables smooth scrolling
      });
    } else {
      // Fallback to scrolling the window
      window.scrollTo({
        top: 0,
        behavior: 'smooth', // Enables smooth scrolling
      });
    }
  }
}
