/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { SuggestedActionComponent } from '@components/suggested-action/suggested-action.component';
import { ChallengeService } from '@services/challenges.service';
import { FitnessWorkoutsService } from '@services/fitness.service';
import { WorkoutsProgressService } from '@services/workouts-progress.service';
import { combineLatest, Observable, of, Subscription } from 'rxjs';
import { catchError, finalize, map, take } from 'rxjs/operators';
import { LoadingCarouselComponent } from '../../components/loading-carousel/loading-carousel.component';
import { AllWorkoutsComponent } from './all-workouts/all-workouts.component';
import { WorkoutsCarouselComponent } from './workouts-carousel/workouts-carousel.component';
import { WorkoutSearchBoxComponent } from "./workout-search-box/workout-search-box.component";

@Component({
  selector: 'app-workouts',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    LoadingCarouselComponent,
    AllWorkoutsComponent,
    SuggestedActionComponent,
    WorkoutsCarouselComponent,
    WorkoutSearchBoxComponent
],
  templateUrl: './fitness.component.html',
  styleUrls: ['./fitness.component.scss'],
})
export class WorkoutsComponent implements OnInit, OnDestroy {
  startedWorkouts$!: Observable<any[]>;
  recommendedWorkouts$!: Observable<any>;
  combinedWorkouts: any[] = [];
  isLoadingCombinedWorkouts = true;
  firstIncompleteChallenge: any;
  isMobile = false;
  isTablet = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private workoutsProgressService: WorkoutsProgressService,
    private workoutsService: FitnessWorkoutsService,
    private challengesService: ChallengeService,
    private breakpointObserver: BreakpointObserver,
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.breakpointObserver
        .observe([Breakpoints.XSmall, Breakpoints.Small])
        .subscribe((result) => {
          const breakpoints = result.breakpoints;
          this.isMobile = breakpoints[Breakpoints.XSmall] ? true : false;
          this.isTablet = breakpoints[Breakpoints.Small] ? true : false;
        }),
    );

    // Fetch and normalize started workouts
    this.startedWorkouts$ = this.workoutsProgressService
      .getStartedWorkouts()
      .pipe(
        take(1),
        map((startedWorkouts: any[]) =>
          startedWorkouts.map((startedWorkout) => ({
            ...startedWorkout.workout,
            progress: startedWorkout.progress,
          })),
        ),
        catchError((error) => {
          console.error('Error fetching started workouts:', error);
          return of([]);
        }),
      );

    // Fetch recommended workouts
    this.recommendedWorkouts$ = this.workoutsService
      .recommendWorkouts([], 3)
      .pipe(
        take(1),
        map((workouts) => workouts.data || []),
        catchError((error) => {
          console.error('Error fetching recommended workouts:', error);
          return of([]);
        }),
      );

    // Combine started and recommended workouts
    combineLatest([this.startedWorkouts$, this.recommendedWorkouts$])
      .pipe(
        map(([startedWorkouts, recommendedWorkouts]) => {
          this.isLoadingCombinedWorkouts = false;
          return [...startedWorkouts, ...recommendedWorkouts];
        }),
        finalize(() => {
          this.isLoadingCombinedWorkouts = false;
        }),
      )
      .subscribe((combinedWorkouts) => {
        this.combinedWorkouts = combinedWorkouts;
      });

    // Fetch first incomplete challenge of type "physical"
    this.loadFirstIncompleteChallenge();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  private async loadFirstIncompleteChallenge() {
    try {
      this.firstIncompleteChallenge =
        await this.challengesService.getFirstIncompleteChallengeByType(
          'physical',
        );
    } catch (error) {
      console.error('Error loading first incomplete challenge:', error);
    }
  }

  completeWorkout() {
    console.log('Complete Workout action triggered');
    // Add your logic here for completing the workout
  }
}
