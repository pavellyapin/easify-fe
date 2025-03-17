import { Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { CoursesService } from '@services/courses.service';
import { setCoursesSearchResults } from '@store/course/course.actions';
import { setDashboardLoading } from '@store/loader/loading.actions';

@Component({
  selector: 'app-courses-search-box',
  standalone: true,
  imports: [MatFormFieldModule, MatIconModule, MatInputModule],
  templateUrl: './courses-search-box.component.html',
  styleUrl: './courses-search-box.component.scss',
})
export class CoursesSearchBoxComponent {
  constructor(
    private store: Store,
    private coursesService: CoursesService,
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
}
