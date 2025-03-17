import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { LoadingCarouselComponent } from '@components/loading-carousel/loading-carousel.component';
import { Store } from '@ngrx/store';
import { CapitalizePipe } from '@services/capitalize.pipe';
import { FinancialPlansService } from '@services/financial.service';
import { setPortfolioSearchResults } from '@store/finance/finance.actions';
import { selectPortfolioSearchResults } from '@store/finance/finance.selectors';
import { setDashboardLoading } from '@store/loader/loading.actions';
import { Observable } from 'rxjs';
import { FinancialPlanTileComponent } from '../financial-plan-tile/financial-plan-tile.component';
import { PortfolioSearchBoxComponent } from '../portfolio-search-box/portfolio-search-box.component';

@Component({
  selector: 'app-portfolios-search-results',
  standalone: true,
  imports: [
    CommonModule,
    LoadingCarouselComponent,
    FinancialPlanTileComponent,
    MatIconModule,
    PortfolioSearchBoxComponent,
    MatChipsModule,
    CapitalizePipe,
    MatButtonModule,
  ],
  templateUrl: './portfolios-search-results.component.html',
  styleUrl: './portfolios-search-results.component.scss',
})
export class PortfoliosSearchResultsComponent implements OnInit {
  searchResults$: Observable<any>;
  allPortfolios: any[] = [];
  relatedTickers: any[] = [];
  keyword!: string;
  isLoadingAll = false;
  isLoadingMore = false;
  isPanelOpen = false;
  lastPortfolio = false;
  portfoliosLimit = 20;
  totalCount!: number;

  constructor(
    private store: Store,
    private portfoliosService: FinancialPlansService,
    private router: Router,
  ) {
    this.searchResults$ = this.store.select(selectPortfolioSearchResults);
  }

  ngOnInit(): void {
    this.loadInitialPortfolios();
  }

  private loadInitialPortfolios(): void {
    this.isLoadingAll = true;

    this.searchResults$.subscribe((portfolios) => {
      this.totalCount = portfolios.portfolios.length;
      this.allPortfolios = portfolios.portfolios.slice(0, this.portfoliosLimit);
      this.relatedTickers = portfolios.relatedTickers;
      this.keyword = portfolios.keyword;
      this.lastPortfolio =
        this.allPortfolios.length >= portfolios.portfolios.length;
      setTimeout(() => {
        this.isLoadingAll = false;
      }, 1000);
    });
  }

  loadMorePortfolios(): void {
    if (this.lastPortfolio) {
      this.scrollToTop();
    } else {
      this.isLoadingMore = true;
    }

    this.searchResults$.subscribe((portfolios) => {
      setTimeout(() => {
        const newLimit = this.portfoliosLimit + 20;
        this.allPortfolios = portfolios.portfolios.slice(0, newLimit);
        this.portfoliosLimit = newLimit;
        this.lastPortfolio =
          this.allPortfolios.length >= portfolios.portfolios.length;
        this.isLoadingMore = false;
      }, 1000);
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
    this.portfoliosService.portfolioKeywordSearch(keyword).subscribe(
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

  onExplorePopularPortfolios() {
    this.router.navigate(['/dashboard/portfolios']);
  }

  navigateToBreadcrumb(destination: string): void {
    switch (destination) {
      case 'home':
        this.router.navigate(['dashboard']);
        break;
      case 'portfoliosHub':
        this.router.navigate(['dashboard/portfolios']);
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
        behavior: 'smooth',
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  }
}
