/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FinancialPlansService } from '@services/financial.service';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { LoadingCarouselComponent } from "../../../components/loading-carousel/loading-carousel.component";
import { FinancialPlanTileComponent } from "../financial-plan-tile/financial-plan-tile.component";
import { PlanCategoryAutocompleteComponent } from "../plan-category-autocomplete/plan-category-autocomplete.component";
import { CapitalizePipe } from "../../../services/capitalize.pipe";

@Component({
  selector: 'app-all-portfolios',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatInputModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    MatSlideToggleModule,
    LoadingCarouselComponent,
    FinancialPlanTileComponent,
    PlanCategoryAutocompleteComponent,
    CapitalizePipe
],
  templateUrl: './all-portfolios.component.html',
  styleUrls: ['./all-portfolios.component.scss'],
})
export class AllPortfoliosComponent implements OnInit {
  allPortfolios$ = new BehaviorSubject<any[]>([]);
  isLoadingAll = false;
  isLoadingMore = false;
  isPanelOpen = false;
  lastPortfolio: any = null;

  filterForm: FormGroup;

  constructor(
    private portfolioService: FinancialPlansService,
    private formBuilder: FormBuilder,
  ) {
    this.filterForm = this.formBuilder.group({
      categories: [[]],
      riskLevels: [[]],
      isNew: [false],
    });
  }

  ngOnInit(): void {
    this.isPanelOpen = window.innerWidth > 960;

    this.portfolioService.getCategoryFilters().subscribe((categories) => {
      this.filterForm.get('categories')?.setValue(categories);
      this.fetchPortfolios();
    });
  }

  fetchPortfolios(): void {
    const { categories, riskLevels, isNew } = this.filterForm.value;

    this.isLoadingAll = true;

    this.portfolioService
      .filterPortfolios(
        { categories, riskLevels, isNew, sortBy: 'createdDate' },
        20,
      )
      .pipe(
        catchError((error) => {
          console.error('Error fetching filtered portfolios:', error);
          return of([]);
        }),
        finalize(() => {
          this.isLoadingAll = false;
        }),
      )
      .subscribe((response) => {
        this.allPortfolios$.next(response.data?.portfolios || []);
        this.lastPortfolio = response.data?.lastPortfolio || null;
      });
  }

  loadMorePortfolios(): void {
    if (!this.lastPortfolio) {
      this.scrollToTop();
      return;
    }

    if (this.isLoadingMore) {
      return;
    }

    this.isLoadingMore = true;

    const { categories, riskLevels, isNew } = this.filterForm.value;

    this.portfolioService
      .filterPortfolios(
        { categories, riskLevels, isNew, sortBy: 'createdDate' },
        20,
        this.lastPortfolio,
      )
      .pipe(
        catchError((error) => {
          console.error('Error loading more portfolios:', error);
          return of([]);
        }),
        finalize(() => (this.isLoadingMore = false)),
      )
      .subscribe((response) => {
        const newPortfolios = response.data?.portfolios || [];
        const currentPortfolios = this.allPortfolios$.value;
        this.allPortfolios$.next([...currentPortfolios, ...newPortfolios]);
        this.lastPortfolio = response.data?.lastPortfolio || null;
      });
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

  onFilterSubmit(filtersMenu: MatMenuTrigger): void {
    filtersMenu.closeMenu();
    this.fetchPortfolios();
  }

  onCategorySelected(category: string): void {
    const categoriesControl = this.filterForm.get('categories')!;
    const categories = [...(categoriesControl.value || [])];

    if (!categories.includes(category)) {
      categories.push(category);
    }

    categoriesControl.setValue(categories);
  }

  removeCategory(category: string): void {
    const categoriesControl = this.filterForm.get('categories')!;
    const categories = [...(categoriesControl.value || [])];

    const index = categories.indexOf(category);
    if (index >= 0) {
      categories.splice(index, 1);
    }

    categoriesControl.setValue(categories);
  }

  onRiskLevelChange(riskLevel: string, checked: boolean): void {
    const riskLevelsControl = this.filterForm.get('riskLevels')!;
    const riskLevels = riskLevelsControl.value as string[];

    if (checked) {
      riskLevels.push(riskLevel);
    } else {
      const index = riskLevels.indexOf(riskLevel);
      if (index > -1) {
        riskLevels.splice(index, 1);
      }
    }
    riskLevelsControl.setValue(riskLevels);
  }

  resetFilters(filtersMenu: MatMenuTrigger): void {
    this.filterForm.reset({
      categories: [],
      riskLevels: [],
      isNew: false,
    });
    this.onFilterSubmit(filtersMenu);
  }
}
