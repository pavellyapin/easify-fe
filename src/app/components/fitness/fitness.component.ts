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
import { Observable, of } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';
import { FitnessWorkoutsService } from '../../services/fitness.service'; // Updated to WorkoutsService
import { WorkoutTileComponent } from './workout-tile/workout-tile.component'; // Updated to WorkoutTileComponent

@Component({
  selector: 'app-workouts',
  standalone: true,
  imports: [
    CommonModule,
    WorkoutTileComponent, // Updated to WorkoutTileComponent
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatIconModule,
  ],
  templateUrl: './fitness.component.html', // Updated to workouts.component.html
  styleUrl: './fitness.component.scss', // Updated to workouts.component.scss
})
export class WorkoutsComponent implements OnInit {
  // Updated to WorkoutsComponent
  startedWorkouts$!: Observable<any[]>; // Updated to startedWorkouts$
  recommendedWorkouts$!: Observable<any>; // Updated to recommendedWorkouts$
  allWorkouts$!: Observable<any>; // Updated to allWorkouts$
  isLoadingRecommended = false;
  isLoadingAll = false;
  allTags$!: Observable<string[]>; // Observable for the dropdown
  selectedTags: string[] = [];

  constructor(private workoutsService: FitnessWorkoutsService) {} // Updated to WorkoutsService

  ngOnInit(): void {
    this.startedWorkouts$ = this.workoutsService.getStartedWorkouts(); // Updated to getStartedWorkouts()
    this.allTags$ = this.workoutsService.getAllWorkoutTags(); // Updated to getAllWorkoutTags()

    this.isLoadingAll = true;

    this.allTags$.subscribe((tags) => {
      // Get the top 5 tags by count (assuming tags are sorted by count)
      this.selectedTags = tags.slice(0, 6);
      this.fetchWorkoutsBasedOnSelectedTags(); // Updated to fetchWorkoutsBasedOnSelectedTags()
    });

    // Set loading state to true before starting to fetch recommended workouts
    this.isLoadingRecommended = true;

    this.recommendedWorkouts$ = this.startedWorkouts$.pipe(
      // Updated to recommendedWorkouts$
      switchMap((startedWorkouts) => {
        // Extract IDs and tags from started workouts
        const startedWorkoutIds = startedWorkouts.map(
          (workout) => workout.workout.id, // Updated to workout
        );
        const tags = startedWorkouts.reduce((acc: string[], workout: any) => {
          return acc.concat(workout.workout.tags || []); // Updated to workout
        }, []);
        return this.workoutsService
          .recommendWorkouts([...new Set(tags.slice(0, 30))], 5) // Updated to recommendWorkouts()
          .pipe(
            map((recommendedWorkouts) =>
              // Filter out the workouts that have already been started
              recommendedWorkouts.data.filter(
                (workout: any) => !startedWorkoutIds.includes(workout.id),
              ),
            ),
            catchError((error) => {
              console.error('Error fetching recommended workouts:', error);
              return of([]); // Return an empty array in case of error
            }),
            finalize(() => {
              this.isLoadingRecommended = false; // Ensure the loading state is reset
            }),
          );
      }),
    );
  }

  fetchWorkoutsBasedOnSelectedTags(): void {
    // Updated to fetchWorkoutsBasedOnSelectedTags()
    if (this.selectedTags.length > 0) {
      this.allWorkouts$ = this.workoutsService // Updated to workoutsService
        .recommendWorkouts(this.selectedTags, 20) // Updated to recommendWorkouts()
        .pipe(
          catchError((error) => {
            console.error('Error fetching workouts:', error);
            return of([]); // Return an empty array in case of error
          }),
          finalize(() => {
            this.isLoadingAll = false; // Ensure the loading state is reset
          }),
        );
    } else {
      this.allWorkouts$ = this.workoutsService.getAllWorkouts(); // Updated to getAllWorkouts()
    }
  }

  onTagSelected(tag: string): void {
    if (!this.selectedTags.includes(tag)) {
      this.selectedTags.push(tag);
      this.fetchWorkoutsBasedOnSelectedTags(); // Updated to fetchWorkoutsBasedOnSelectedTags()
    }
  }

  removeTag(tag: string): void {
    const index = this.selectedTags.indexOf(tag);
    if (index >= 0) {
      this.selectedTags.splice(index, 1);
      this.fetchWorkoutsBasedOnSelectedTags(); // Updated to fetchWorkoutsBasedOnSelectedTags()
    }
  }
}
