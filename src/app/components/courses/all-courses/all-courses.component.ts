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
import { CapitalizePipe } from '@services/capitalize.pipe';
import { CoursesService } from '@services/courses.service';
import { Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { CourseCategoryAutocompleteComponent } from '../course-category-autocomplete/course-category-autocomplete.component';
import { CourseTileComponent } from '../course-tile/course-tile.component';
import { LoadingCarouselComponent } from '../courses-carousel/loading-carousel/loading-carousel.component';

@Component({
  selector: 'app-all-courses',
  standalone: true,
  imports: [
    CommonModule,
    CourseTileComponent,
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
    CourseCategoryAutocompleteComponent,
  ],
  templateUrl: './all-courses.component.html',
  styleUrls: ['./all-courses.component.scss'],
})
export class AllCoursesComponent implements OnInit {
  allCourses$!: Observable<any>;
  isLoadingAll = false;
  isPanelOpen = false;

  filterForm: FormGroup; // Form for the filter

  constructor(
    private coursesService: CoursesService,
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
    // Fetch category filters from user workSkills or random categories
    this.coursesService.getCategoryFilters().subscribe((categories) => {
      this.filterForm.get('categories')?.setValue(categories); // Populate form categories
      this.fetchCourses();
    });
  }

  // Function to fetch courses based on form filters
  fetchCourses(): void {
    const { categories, levels, isNew } = this.filterForm.value; // Extract form data

    this.isLoadingAll = true;

    this.coursesService
      .filterCourses(
        { categories, levels, isNew, sortBy: 'createdDate' }, // Pass filters and sort order
        20, // Number of courses to return
      )
      .pipe(
        catchError((error) => {
          console.error('Error fetching filtered courses:', error);
          return of([]); // Return an empty array in case of error
        }),
        finalize(() => {
          this.isLoadingAll = false; // Ensure the loading state is reset
        }),
      )
      .subscribe((allCourses) => {
        this.allCourses$ = of(allCourses.data.courses); // Assuming the response format
      });
  }

  // Submit form and fetch courses when the filter is applied
  onFilterSubmit(): void {
    this.fetchCourses();
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

  resetFilters(): void {
    this.filterForm.reset({
      categories: [],
      levels: [],
      isNew: false,
    });
  }
}
