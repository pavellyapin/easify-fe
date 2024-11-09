/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { FitnessWorkoutsService } from '@services/fitness.service';
import { TimeUtils } from '@services/time.utils';
import { UserService } from '@services/user.service';
import { getDoc } from 'firebase/firestore';
import { combineLatest, from, Observable, of } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';
import { WorkoutTileComponent } from './workout-tile/workout-tile.component';

@Component({
  selector: 'app-workouts',
  standalone: true,
  imports: [
    CommonModule,
    WorkoutTileComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatIconModule,
  ],
  templateUrl: './fitness.component.html',
  styleUrls: ['./fitness.component.scss'],
})
export class WorkoutsComponent implements OnInit {
  startedWorkouts$!: Observable<any[]>;
  recommendedWorkouts$!: Observable<any>;
  allWorkouts$!: Observable<any>;
  isLoadingRecommended = false;
  isLoadingAll = false;
  allTags$!: Observable<string[]>; // Observable for the dropdown
  selectedTags: string[] = [];

  constructor(
    private workoutsService: FitnessWorkoutsService,
    private timeUtils: TimeUtils,
    private userService: UserService, // Inject the user service
  ) {}

  ngOnInit(): void {
    this.startedWorkouts$ = this.workoutsService.getStartedWorkouts();
    this.allTags$ = this.workoutsService.getAllWorkoutTags();

    this.isLoadingAll = true;

    this.allTags$.subscribe((tags) => {
      this.selectedTags = tags.slice(0, 6); // Get the top 6 tags
      this.fetchWorkoutsBasedOnSelectedTags();
    });

    // Set loading state to true before starting to fetch recommended workouts
    this.isLoadingRecommended = true;

    // Combine user lifestyleHealth workout tags and started workouts tags
    this.recommendedWorkouts$ = combineLatest([
      this.userService.getUserDocRefAsObs().pipe(
        switchMap((userRef) =>
          from(getDoc(userRef!)).pipe(
            map((doc: any) => {
              const lifestyleHealth = doc.exists()
                ? doc.data().lifestyleHealth || {}
                : {};
              return [
                ...(lifestyleHealth.workoutCategories || []),
                ...(lifestyleHealth.workoutTags || []),
              ];
            }),
          ),
        ),
      ),
      this.startedWorkouts$.pipe(
        map((startedWorkouts) =>
          startedWorkouts.reduce(
            (acc: string[], workout: any) =>
              acc.concat(workout.workout.tags || []),
            [],
          ),
        ),
      ),
    ]).pipe(
      switchMap(([userTags, startedWorkoutTags]) => {
        const combinedTags = [
          ...new Set([...userTags, ...startedWorkoutTags]),
        ].slice(0, 30); // Limit to 30 tags
        return this.workoutsService.recommendWorkouts(combinedTags, 5).pipe(
          map((recommendedWorkouts) =>
            recommendedWorkouts.data.filter(
              (workout: any) => !startedWorkoutTags.includes(workout.id),
            ),
          ),
          catchError((error) => {
            console.error('Error fetching recommended workouts:', error);
            return of([]); // Return an empty array in case of error
          }),
          finalize(() => {
            this.isLoadingRecommended = false; // Reset loading state
          }),
        );
      }),
    );
  }

  fetchWorkoutsBasedOnSelectedTags(): void {
    if (this.selectedTags.length > 0) {
      this.allWorkouts$ = this.workoutsService
        .recommendWorkouts(this.selectedTags, 20)
        .pipe(
          map((workouts) =>
            workouts.data.sort(this.timeUtils.sortByCreatedDate),
          ),
          catchError((error) => {
            console.error('Error fetching workouts:', error);
            return of([]); // Return an empty array in case of error
          }),
          finalize(() => {
            this.isLoadingAll = false; // Ensure the loading state is reset
          }),
        );
    } else {
      this.allWorkouts$ = this.workoutsService.getAllWorkouts();
    }
  }

  onTagSelected(tag: string): void {
    if (!this.selectedTags.includes(tag)) {
      this.selectedTags.push(tag);
      this.fetchWorkoutsBasedOnSelectedTags();
    }
  }

  removeTag(tag: string): void {
    const index = this.selectedTags.indexOf(tag);
    if (index >= 0) {
      this.selectedTags.splice(index, 1);
      this.fetchWorkoutsBasedOnSelectedTags();
    }
  }
}
