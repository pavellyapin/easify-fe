/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { FitnessWorkoutsService } from '@services/fitness.service';
import { selectStartedWorkout } from '@store/started-workout/started-workout.selectors';
import {
  catchError,
  finalize,
  map,
  Observable,
  of,
  Subscription,
  take,
} from 'rxjs';
import { LoadingCarouselComponent } from '../../../components/loading-carousel/loading-carousel.component';
import { WorkoutsCarouselComponent } from '../workouts-carousel/workouts-carousel.component';
import { WorkoutBreakdownComponent } from './workout-breakdown/workout-breakdown.component';
import { WorkoutIntroComponent } from './workout-intro/workout-intro.component';
import { WorkoutStatsComponent } from './workout-stats/workout-stats.component';

@Component({
  selector: 'app-workout-overview',
  standalone: true,
  imports: [
    WorkoutBreakdownComponent,
    LoadingCarouselComponent,
    CommonModule,
    WorkoutsCarouselComponent,
    MatIconModule,
    MatButtonModule,
    WorkoutStatsComponent,
    WorkoutIntroComponent,
  ],
  templateUrl: './workout-overview.component.html',
  styleUrl: './workout-overview.component.scss',
})
export class WorkoutOverviewComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = []; // Array to store subscriptions

  workout: any;
  recommendedWorkouts: any[] = [];
  isLoadingRecommendedWorkouts = true;
  startedWorkout$: Observable<any | null> | undefined; // Observable to get the started workout
  isMobile = false;
  isTablet = false;

  constructor(
    private route: ActivatedRoute,
    private workoutsService: FitnessWorkoutsService,
    private store: Store,
    private router: Router,
    private breakpointObserver: BreakpointObserver,
  ) {}

  ngOnInit(): void {
    // Initialize startedWorkout$ observable from the store
    this.startedWorkout$ = this.store.select(selectStartedWorkout);
    this.workout = this.route.snapshot.data['workout'];
    this.subscriptions.push(
      this.breakpointObserver
        .observe([Breakpoints.XSmall, Breakpoints.Small])
        .subscribe((result) => {
          const breakpoints = result.breakpoints;
          this.isMobile = !!breakpoints[Breakpoints.XSmall];
          this.isTablet = !!breakpoints[Breakpoints.Small];
        }),
    );
    this.loadRecommendedWorkouts();
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  loadRecommendedWorkouts(): void {
    this.subscriptions.push(
      this.workoutsService
        .recommendWorkouts(this.workout.tags, 3)
        .pipe(
          take(1),
          map((response) => {
            this.recommendedWorkouts = response.data || [];
            this.isLoadingRecommendedWorkouts = false;
          }),
          catchError((error) => {
            console.error('Error fetching recommended workouts:', error);
            this.isLoadingRecommendedWorkouts = false;
            return of([]);
          }),
          finalize(() => {
            this.isLoadingRecommendedWorkouts = false;
          }),
        )
        .subscribe(),
    );
  }

  navigateToBreadcrumb(destination: string): void {
    switch (destination) {
      case 'home':
        this.router.navigate(['dashboard']);
        break;
      case 'fitnessHub':
        this.router.navigate(['dashboard/fitness']);
        break;
      default:
        console.warn('Unrecognized breadcrumb destination:', destination);
    }
  }
}
