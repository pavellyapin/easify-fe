import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
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
import { LoadingCarouselComponent } from '@components/loading-carousel/loading-carousel.component';
import { CapitalizePipe } from '@services/capitalize.pipe';
import { GrowthService } from '@services/growth.service';
import { BehaviorSubject, catchError, finalize, of } from 'rxjs';
import { IndustriesAutocompleteComponent } from '../industries-autocomplete/industries-autocomplete.component';
import { IndustryTileComponent } from '../industry-tile/industry-tile.component';

@Component({
  selector: 'app-all-industries',
  standalone: true,
  imports: [
    CommonModule,
    LoadingCarouselComponent,
    IndustryTileComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatInputModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    LoadingCarouselComponent,
    MatSlideToggleModule,
    CapitalizePipe,
    IndustriesAutocompleteComponent,
  ],
  templateUrl: './all-industries.component.html',
  styleUrl: './all-industries.component.scss',
})
export class AllIndustriesComponent {
  allIndustries$ = new BehaviorSubject<any[]>([]); // Stores and emits the industry list
  isLoadingAll = false;
  isLoadingMore = false;
  isPanelOpen = false;
  lastIndustry: any = null;
  filterForm: FormGroup; // Form for the filter

  constructor(
    private growthService: GrowthService,
    private formBuilder: FormBuilder, // Inject FormBuilder
  ) {
    // Initialize the form with default values
    this.filterForm = this.formBuilder.group({
      tags: [[]], // Categories is an array of selected values
      isNew: [false], // isNew is a boolean flag
    });
  }

  ngOnInit(): void {
    // Set the panel to be open by default if the screen size is large
    this.isPanelOpen = window.innerWidth > 960;
    // Fetch category filters from user preferences or random categories
    this.growthService.getIndustryFilters().subscribe((categories) => {
      this.filterForm.get('tags')?.setValue(categories); // Populate form categories
      this.fetchIndustries();
    });
  }

  fetchIndustries(): void {
    const { tags, isNew } = this.filterForm.value;

    this.isLoadingAll = true;
    this.lastIndustry = null; // Reset pagination

    this.growthService
      .filterIndustries({ tags, isNew, sortBy: 'updatedDate' }, 20)
      .pipe(
        catchError((error) => {
          console.error('Error fetching industries:', error);
          return of([]); // Return an empty array if an error occurs
        }),
        finalize(() => (this.isLoadingAll = false)),
      )
      .subscribe((response) => {
        this.allIndustries$.next(response.data?.industries || []); // Replace existing industries
        this.lastIndustry = response.data?.lastIndustry || null; // Update pagination reference
      });
  }

  loadMoreIndustries(): void {
    if (!this.lastIndustry) {
      this.scrollToTop(); // If no more industries to load, scroll to top
      return;
    }

    if (this.isLoadingMore) {
      return;
    }

    this.isLoadingMore = true;

    const { tags, isNew } = this.filterForm.value;

    this.growthService
      .filterIndustries(
        { tags, isNew, sortBy: 'updatedDate' },
        20,
        this.lastIndustry,
      )
      .pipe(
        catchError((error) => {
          console.error('Error loading more industries:', error);
          return of([]);
        }),
        finalize(() => (this.isLoadingMore = false)),
      )
      .subscribe((response) => {
        const newIndustries = response.data?.industries || [];
        const currentIndustries = this.allIndustries$.value; // Access current value
        this.allIndustries$.next([...currentIndustries, ...newIndustries]); // Append new industries
        this.lastIndustry = response.data?.lastIndustry || null; // Update pagination reference
      });
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

  // Submit form and fetch industries when the filter is applied
  onFilterSubmit(filtersMenu: MatMenuTrigger): void {
    // Close the menu
    filtersMenu.closeMenu();
    this.fetchIndustries();
  }

  onCategorySelected(category: string): void {
    const categoriesControl = this.filterForm.get('tags')!;
    const categories = [...(categoriesControl.value || [])]; // Create a shallow copy of the array

    if (!categories.includes(category)) {
      categories.push(category); // Add the new category to the copied array
    }

    categoriesControl.setValue(categories); // Set the updated array back to the form control
  }

  removeCategory(category: string): void {
    const categoriesControl = this.filterForm.get('tags')!;
    const categories = [...(categoriesControl.value || [])]; // Create a shallow copy of the array

    const index = categories.indexOf(category);
    if (index >= 0) {
      categories.splice(index, 1); // Remove the category from the copied array
    }

    categoriesControl.setValue(categories); // Set the updated array back to the form control
  }

  // Handle level checkbox changes
  onLevelChange(level: string, checked: boolean): void {
    const levelsControl = this.filterForm.get('levels')!;
    const levels = levelsControl.value as string[];

    if (checked) {
      levels.push(level);
    } else {
      const index = levels.indexOf(level);
      if (index > -1) {
        levels.splice(index, 1);
      }
    }
    levelsControl.setValue(levels);
  }

  resetFilters(filtersMenu: MatMenuTrigger): void {
    this.filterForm.reset({
      tags: [],
      isNew: false,
    });
    this.onFilterSubmit(filtersMenu);
  }
}
