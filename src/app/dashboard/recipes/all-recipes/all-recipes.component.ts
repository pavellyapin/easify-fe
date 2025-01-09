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
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { LoadingCarouselComponent } from '@components/loading-carousel/loading-carousel.component';
import { CapitalizePipe } from '@services/capitalize.pipe';
import { RecipesService } from '@services/recipes.service';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { CuisineAutocompleteComponent } from '../cuisine-autocomplete/cuisine-autocomplete.component';
import { RecipeTileComponent } from '../recipe-tile/recipe-tile.component';

@Component({
  selector: 'app-all-recipes',
  standalone: true,
  imports: [
    CommonModule,
    RecipeTileComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatExpansionModule,
    MatInputModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    LoadingCarouselComponent,
    MatSlideToggleModule,
    CapitalizePipe,
    CuisineAutocompleteComponent,
  ],
  templateUrl: './all-recipes.component.html',
  styleUrls: ['./all-recipes.component.scss'],
})
export class AllRecipesComponent implements OnInit {
  allRecipes$ = new BehaviorSubject<any[]>([]); // Stores and emits the recipe list
  isLoadingAll = false;
  isLoadingMore = false;
  isPanelOpen = false;
  lastRecipe: any = null;
  filterForm: FormGroup; // Form for the filter

  constructor(
    private recipesService: RecipesService,
    private formBuilder: FormBuilder, // Inject FormBuilder
  ) {
    // Initialize the form with default values
    this.filterForm = this.formBuilder.group({
      cuisines: [[]], // Categories is an array of selected values
      levels: [[]], // Cuisines is an array of selected values
      isNew: [false], // isNew is a boolean flag
    });
  }

  ngOnInit(): void {
    // Set the panel to be open by default if the screen size is large
    this.isPanelOpen = window.innerWidth > 960;
    // Fetch category filters from user preferences or random categories
    this.recipesService.getCuisineFilters().subscribe((categories) => {
      this.filterForm.get('cuisines')?.setValue(categories); // Populate form categories
      this.fetchRecipes();
    });
  }

  fetchRecipes(): void {
    const { levels, cuisines, isNew } = this.filterForm.value;

    this.isLoadingAll = true;
    this.lastRecipe = null; // Reset pagination

    this.recipesService
      .filterRecipes({ levels, cuisines, isNew, sortBy: 'createdDate' }, 20)
      .pipe(
        catchError((error) => {
          console.error('Error fetching recipes:', error);
          return of([]); // Return an empty array if an error occurs
        }),
        finalize(() => (this.isLoadingAll = false)),
      )
      .subscribe((response) => {
        this.allRecipes$.next(response.data?.recipes || []); // Replace existing recipes
        this.lastRecipe = response.data?.lastRecipe || null; // Update pagination reference
      });
  }

  loadMoreRecipes(): void {
    if (!this.lastRecipe) {
      this.scrollToTop(); // If no more recipes to load, scroll to top
      return;
    }

    if (this.isLoadingMore) {
      return;
    }

    this.isLoadingMore = true;

    const { levels, cuisines, isNew } = this.filterForm.value;

    this.recipesService
      .filterRecipes(
        { levels, cuisines, isNew, sortBy: 'createdDate' },
        20,
        this.lastRecipe,
      )
      .pipe(
        catchError((error) => {
          console.error('Error loading more recipes:', error);
          return of([]);
        }),
        finalize(() => (this.isLoadingMore = false)),
      )
      .subscribe((response) => {
        const newRecipes = response.data?.recipes || [];
        const currentRecipes = this.allRecipes$.value; // Access current value
        this.allRecipes$.next([...currentRecipes, ...newRecipes]); // Append new recipes
        this.lastRecipe = response.data?.lastRecipe || null; // Update pagination reference
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

  // Submit form and fetch recipes when the filter is applied
  onFilterSubmit(): void {
    this.fetchRecipes();
  }

  onCategorySelected(category: string): void {
    const categoriesControl = this.filterForm.get('cuisines')!;
    const categories = [...(categoriesControl.value || [])]; // Create a shallow copy of the array

    if (!categories.includes(category)) {
      categories.push(category); // Add the new category to the copied array
    }

    categoriesControl.setValue(categories); // Set the updated array back to the form control
  }

  removeCategory(category: string): void {
    const categoriesControl = this.filterForm.get('cuisines')!;
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

  resetFilters(): void {
    this.filterForm.reset({
      cuisines: [],
      levels: [],
      isNew: false,
    });
  }
}
