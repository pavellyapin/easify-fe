import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { LoadingCarouselComponent } from '@components/loading-carousel/loading-carousel.component';
import { Store } from '@ngrx/store';
import { CapitalizePipe } from '@services/capitalize.pipe';
import { CoursesService } from '@services/courses.service';
import { setCoursesSearchResults } from '@store/course/course.actions';
import { selectCourseSearchResults } from '@store/course/course.selectors';
import { setDashboardLoading } from '@store/loader/loading.actions';
import { Observable } from 'rxjs';
import { CourseTileComponent } from '../course-tile/course-tile.component';
import { CoursesSearchBoxComponent } from '../courses-search-box/courses-search-box.component';

@Component({
  selector: 'app-courses-search-results',
  standalone: true,
  imports: [
    CommonModule,
    LoadingCarouselComponent,
    CourseTileComponent,
    MatIconModule,
    CoursesSearchBoxComponent,
    MatChipsModule,
    CapitalizePipe,
    MatButtonModule,
  ],
  templateUrl: './courses-search-results.component.html',
  styleUrl: './courses-search-results.component.scss',
})
export class CoursesSearchResultsComponent implements OnInit {
  searchResults$: Observable<any>;
  allCourses: any[] = []; // Stores and emits the course list
  relatedCategories: any[] = [];
  relatedJobTitles: any[] = [];
  keyword!: string;
  isLoadingAll = false;
  isLoadingMore = false;
  isPanelOpen = false;
  lastCourse = false;
  coursesLimit = 20;
  totalCount!: number;

  constructor(
    private store: Store,
    private coursesService: CoursesService,
    private router: Router,
  ) {
    this.searchResults$ = this.store.select(selectCourseSearchResults);
  }

  ngOnInit(): void {
    this.loadInitialCourses();
  }

  private loadInitialCourses(): void {
    this.isLoadingAll = true;

    this.searchResults$.subscribe((courses) => {
      this.totalCount = courses.courses.length;
      this.allCourses = courses.courses.slice(0, this.coursesLimit);
      this.relatedCategories = courses.relatedCategories;
      this.relatedJobTitles = courses.relatedJobTitles;
      this.keyword = courses.keyword;
      this.lastCourse = this.allCourses.length >= courses.courses.length;
      setTimeout(() => {
        this.isLoadingAll = false;
      }, 1000); // Simulate loading timeout
    });
  }

  loadMoreCourses(): void {
    if (this.lastCourse) {
      this.scrollToTop();
    } else {
      this.isLoadingMore = true;
    }

    this.searchResults$.subscribe((courses) => {
      setTimeout(() => {
        const newLimit = this.coursesLimit + 20;
        this.allCourses = courses.courses.slice(0, newLimit);
        this.coursesLimit = newLimit;
        this.lastCourse = this.allCourses.length >= courses.courses.length;
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
    this.coursesService.courseKeywordSearch(keyword).subscribe(
      (results) => {
        // Save results to state
        this.store.dispatch(setCoursesSearchResults({ results: results.data }));

        // Turn off the loading state
        this.store.dispatch(setDashboardLoading({ isLoading: false }));

        // Navigate to the search results page
        this.router.navigate(['/dashboard/course-search-results']);
      },
      (error) => {
        console.error('Error searching courses:', error);

        // Turn off the loading state in case of an error
        this.store.dispatch(setDashboardLoading({ isLoading: false }));
      },
    );
  }

  onExplorePopularCourses() {
    this.router.navigate(['/dashboard/courses']);
  }

  navigateToBreadcrumb(destination: string): void {
    switch (destination) {
      case 'home':
        this.router.navigate(['dashboard']);
        break;
      case 'coursesHub':
        this.router.navigate(['dashboard/courses']);
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
