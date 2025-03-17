import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { LoadingCarouselComponent } from '@components/loading-carousel/loading-carousel.component';
import { Store } from '@ngrx/store';
import { CapitalizePipe } from '@services/capitalize.pipe';
import { FitnessWorkoutsService } from '@services/fitness.service';
import { setWorkoutsSearchResults } from '@store/fitness/fitness.actions';
import { selectWorkoutsSearchResults } from '@store/fitness/fitness.selectors';
import { setDashboardLoading } from '@store/loader/loading.actions';
import { Observable } from 'rxjs';
import { WorkoutSearchBoxComponent } from '../workout-search-box/workout-search-box.component';
import { WorkoutTileComponent } from '../workout-tile/workout-tile.component';

@Component({
  selector: 'app-workout-search-results',
  standalone: true,
  imports: [
    CommonModule,
    LoadingCarouselComponent,
    WorkoutTileComponent,
    MatIconModule,
    WorkoutSearchBoxComponent,
    MatChipsModule,
    CapitalizePipe,
    MatButtonModule,
  ],
  templateUrl: './workout-search-results.component.html',
  styleUrl: './workout-search-results.component.scss',
})
export class WorkoutSearchResultsComponent implements OnInit {
  searchResults$: Observable<any>;
  allWorkouts: any[] = []; // Stores and emits the workout list
  relatedEquipment: any[] = [];
  relatedCategories: any[] = [];
  keyword!: string;
  isLoadingAll = false;
  isLoadingMore = false;
  isPanelOpen = false;
  lastWorkout = false;
  workoutsLimit = 20;
  totalCount!: number;

  constructor(
    private store: Store,
    private fitnessService: FitnessWorkoutsService,
    private router: Router,
  ) {
    this.searchResults$ = this.store.select(selectWorkoutsSearchResults);
  }

  ngOnInit(): void {
    this.loadInitialWorkouts();
  }

  private loadInitialWorkouts(): void {
    this.isLoadingAll = true;

    this.searchResults$.subscribe((workouts) => {
      this.totalCount = workouts.workouts.length;
      this.allWorkouts = workouts.workouts.slice(0, this.workoutsLimit);
      this.relatedCategories = workouts.relatedCategories;
      this.relatedEquipment = workouts.relatedEquipment;
      this.keyword = workouts.keyword;
      this.lastWorkout = this.allWorkouts.length >= workouts.workouts.length;
      setTimeout(() => {
        this.isLoadingAll = false;
      }, 1000); // Simulate loading timeout
    });
  }

  loadMoreWorkouts(): void {
    if (this.lastWorkout) {
      this.scrollToTop();
    } else {
      this.isLoadingMore = true;
    }

    this.searchResults$.subscribe((workouts) => {
      setTimeout(() => {
        const newLimit = this.workoutsLimit + 20;
        this.allWorkouts = workouts.workouts.slice(0, newLimit);
        this.workoutsLimit = newLimit;
        this.lastWorkout = this.allWorkouts.length >= workouts.workouts.length;
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
    this.fitnessService.workoutKeywordSearch(keyword).subscribe(
      (results) => {
        // Save results to state
        this.store.dispatch(
          setWorkoutsSearchResults({ results: results.data }),
        );

        // Turn off the loading state
        this.store.dispatch(setDashboardLoading({ isLoading: false }));

        // Navigate to the search results page
        this.router.navigate(['/dashboard/workout-search-results']);
      },
      (error) => {
        console.error('Error searching workouts:', error);

        // Turn off the loading state in case of an error
        this.store.dispatch(setDashboardLoading({ isLoading: false }));
      },
    );
  }

  onExplorePopularWorkouts() {
    this.router.navigate(['/dashboard/workouts']);
  }

  navigateToBreadcrumb(destination: string): void {
    switch (destination) {
      case 'home':
        this.router.navigate(['dashboard']);
        break;
      case 'workoutsHub':
        this.router.navigate(['dashboard/fitness']);
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
