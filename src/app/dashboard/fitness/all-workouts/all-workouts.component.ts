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
import { LoadingCarouselComponent } from '@components/loading-carousel/loading-carousel.component';
import { CapitalizePipe } from '@services/capitalize.pipe';
import { FitnessWorkoutsService } from '@services/fitness.service';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { WorkoutCategoryAutocompleteComponent } from '../workout-category-autocomplete/workout-category-autocomplete.component';
import { WorkoutTileComponent } from '../workout-tile/workout-tile.component';

@Component({
  selector: 'app-all-workouts',
  standalone: true,
  imports: [
    CommonModule,
    WorkoutTileComponent,
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
    WorkoutCategoryAutocompleteComponent,
  ],
  templateUrl: './all-workouts.component.html',
  styleUrls: ['./all-workouts.component.scss'],
})
export class AllWorkoutsComponent implements OnInit {
  allWorkouts$ = new BehaviorSubject<any[]>([]);
  isLoadingAll = false;
  isLoadingMore = false;
  isPanelOpen = false;
  lastWorkout: any = null;

  filterForm: FormGroup; // Form for the filter

  constructor(
    private workoutsService: FitnessWorkoutsService,
    private formBuilder: FormBuilder, // Inject FormBuilder
  ) {
    // Initialize the form with default values
    this.filterForm = this.formBuilder.group({
      categories: [[]], // Categories is an array of selected values
      levels: [[]], // Levels is an array of selected values
      isNew: [false], // isNew is a boolean flag
    });
  }

  ngOnInit(): void {
    // Set the panel to be open by default if the screen size is large
    this.isPanelOpen = window.innerWidth > 960;
    // Fetch category filters from user preferences or random categories
    this.workoutsService.getCategoryFilters().subscribe((categories) => {
      this.filterForm.get('categories')?.setValue(categories); // Populate form categories
      this.fetchWorkouts();
    });
  }

  // Function to fetch workouts based on form filters
  fetchWorkouts(): void {
    const { categories, levels, isNew } = this.filterForm.value; // Extract form data

    this.isLoadingAll = true;

    this.workoutsService
      .filterWorkouts(
        { categories, levels, isNew, sortBy: 'createdDate' }, // Pass filters and sort order
        20, // Number of workouts to return
      )
      .pipe(
        catchError((error) => {
          console.error('Error fetching filtered workouts:', error);
          return of([]); // Return an empty array in case of error
        }),
        finalize(() => {
          this.isLoadingAll = false; // Ensure the loading state is reset
        }),
      )
      .subscribe((response) => {
        this.allWorkouts$.next(response.data?.workouts || []); // Assuming the response format
        this.lastWorkout = response.data?.lastWorkout || null; // Assuming the response format
      });
  }

  loadMoreWorkouts(): void {
    if (!this.lastWorkout) {
      this.scrollToTop();
      return;
    }

    if (this.isLoadingMore) {
      return;
    }

    this.isLoadingMore = true;

    const { categories, levels, isNew } = this.filterForm.value;

    this.workoutsService
      .filterWorkouts(
        { levels, categories, isNew, sortBy: 'createdDate' },
        20,
        this.lastWorkout,
      )
      .pipe(
        catchError((error) => {
          console.error('Error loading more workouts:', error);
          return of([]);
        }),
        finalize(() => (this.isLoadingMore = false)),
      )
      .subscribe((response) => {
        const newWorkouts = response.data?.workouts || [];
        const currentWorkouts = this.allWorkouts$.value;
        this.allWorkouts$.next([...currentWorkouts, ...newWorkouts]);
        this.lastWorkout = response.data?.lastWorkout || null;
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

  // Submit form and fetch workouts when the filter is applied
  onFilterSubmit(filtersMenu: MatMenuTrigger): void {
    // Close the menu
    filtersMenu.closeMenu();
    this.fetchWorkouts();
  }

  onCategorySelected(category: string): void {
    const categoriesControl = this.filterForm.get('categories')!;
    const categories = [...(categoriesControl.value || [])]; // Create a shallow copy of the array

    if (!categories.includes(category)) {
      categories.push(category); // Add the new category to the copied array
    }

    categoriesControl.setValue(categories); // Set the updated array back to the form control
  }

  removeCategory(category: string): void {
    const categoriesControl = this.filterForm.get('categories')!;
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
      categories: [],
      levels: [],
      isNew: false,
    });
    this.onFilterSubmit(filtersMenu);
  }
}
