import { Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { FinancialPlansService } from '@services/financial.service';
import { setPortfolioSearchResults } from '@store/finance/finance.actions';
import { setDashboardLoading } from '@store/loader/loading.actions';

@Component({
  selector: 'app-portfolio-search-box',
  standalone: true,
  imports: [MatFormFieldModule, MatIconModule, MatInputModule],
  templateUrl: './portfolio-search-box.component.html',
  styleUrl: './portfolio-search-box.component.scss',
})
export class PortfolioSearchBoxComponent {
  constructor(
    private store: Store,
    private financialService: FinancialPlansService,
    private router: Router,
  ) {}

  onSearchKeyword(keyword: string): void {
    keyword = keyword.trim();
    if (!keyword) {
      return; // Do nothing if search is empty
    }

    // Dispatch dashboard loading state
    this.store.dispatch(setDashboardLoading({ isLoading: true }));

    // Call the search service
    this.financialService.portfolioKeywordSearch(keyword).subscribe(
      (results) => {
        // Save results to state
        this.store.dispatch(
          setPortfolioSearchResults({ results: results.data }),
        );

        // Turn off the loading state
        this.store.dispatch(setDashboardLoading({ isLoading: false }));

        // Navigate to the search results page
        this.router.navigate(['/dashboard/portfolio-search-results']);
      },
      (error) => {
        console.error('Error searching courses:', error);

        // Turn off the loading state in case of an error
        this.store.dispatch(setDashboardLoading({ isLoading: false }));
      },
    );
  }
}
