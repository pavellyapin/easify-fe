import { Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { GrowthService } from '@services/growth.service';
import { setIndustriesSearchResults } from '@store/growth/growth.actions';
import { setDashboardLoading } from '@store/loader/loading.actions';

@Component({
  selector: 'app-industry-search-box',
  standalone: true,
  imports: [MatFormFieldModule, MatIconModule, MatInputModule],
  templateUrl: './industry-search-box.component.html',
  styleUrl: './industry-search-box.component.scss',
})
export class IndustrySearchBoxComponent {
  constructor(
    private store: Store,
    private router: Router,
    private growthService: GrowthService,
  ) {}

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
}
