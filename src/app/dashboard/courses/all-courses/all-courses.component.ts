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
import { CoursesService } from '@services/courses.service';
import { BehaviorSubject, of, Subscription } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { CourseCategoryAutocompleteComponent } from '../course-category-autocomplete/course-category-autocomplete.component';
import { CourseTileComponent } from '../course-tile/course-tile.component';

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
    MatMenuModule,
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
  allCourses$ = new BehaviorSubject<any[]>([]);
  isLoadingAll = false;
  isLoadingMore = false;
  isPanelOpen = false;
  lastCourse: any = null;
  subscriptions: Subscription[] = [];

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
    const categorySubscription = this.coursesService
      .getCategoryFilters()
      .subscribe((categories) => {
        this.filterForm.get('categories')?.setValue(categories);
        this.fetchCourses();
      });

    this.subscriptions.push(categorySubscription);
  }

  // Function to fetch courses based on form filters
  fetchCourses(): void {
    const { categories, levels, isNew } = this.filterForm.value;
    this.isLoadingAll = true;

    const fetchSubscription = this.coursesService
      .filterCourses({ categories, levels, isNew, sortBy: 'createdDate' }, 20)
      .pipe(
        catchError((error) => {
          console.error('Error fetching filtered courses:', error);
          return of([]);
        }),
        finalize(() => {
          this.isLoadingAll = false;
        }),
      )
      .subscribe((response) => {
        this.allCourses$.next(response.data?.courses || []);
        this.lastCourse = response.data?.lastCourse || null;
      });

    this.subscriptions.push(fetchSubscription);
  }

  loadMoreCourses(): void {
    if (!this.lastCourse) {
      this.scrollToTop();
      return;
    }

    if (this.isLoadingMore) {
      return;
    }

    this.isLoadingMore = true;
    const { categories, levels, isNew } = this.filterForm.value;

    const loadMoreSubscription = this.coursesService
      .filterCourses(
        { levels, categories, isNew, sortBy: 'createdDate' },
        20,
        this.lastCourse,
      )
      .pipe(
        catchError((error) => {
          console.error('Error loading more courses:', error);
          return of([]);
        }),
        finalize(() => (this.isLoadingMore = false)),
      )
      .subscribe((response) => {
        const newCourses = response.data?.courses || [];
        const currentCourses = this.allCourses$.value;
        this.allCourses$.next([...currentCourses, ...newCourses]);
        this.lastCourse = response.data?.lastCourse || null;
      });

    this.subscriptions.push(loadMoreSubscription); // ✅ Store subscription
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

  // Submit form and fetch courses when the filter is applied
  onFilterSubmit(filtersMenu: MatMenuTrigger): void {
    // Close the menu
    filtersMenu.closeMenu();
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

  resetFilters(filtersMenu: MatMenuTrigger): void {
    this.filterForm.reset({
      categories: [],
      levels: [],
      isNew: false,
    });
    this.onFilterSubmit(filtersMenu);
  }

  // ✅ Unsubscribe from all active subscriptions when the component is destroyed
  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions = [];
  }
}
