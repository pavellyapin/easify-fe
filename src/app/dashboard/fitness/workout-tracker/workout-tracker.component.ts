/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { FitnessWorkoutsService } from '@services/fitness.service';
import { WorkoutsProgressService } from '@services/workouts-progress.service';

@Component({
  selector: 'app-workout-tracker',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
  ],
  templateUrl: './workout-tracker.component.html',
  styleUrl: './workout-tracker.component.scss',
})
export class WorkoutTrackerComponent {
  @Input() challenge: any;

  constructor(
    private workoutsService: FitnessWorkoutsService,
    private workoutsProgressService: WorkoutsProgressService,
    private router: Router,
  ) {}

  // Function to handle the arrow button click
  async onArrowClick(): Promise<void> {
    console.log('Arrow clicked!');

    const { completedSteps = [] } = this.challenge;
    const priorityOrder = [
      'totalStartedWorkouts',
      'totalCompletedWorkouts',
      'beginner',
      'intermediate',
      'advanced',
      'categories',
    ];

    // Find the first incomplete step based on priority
    const nextStepKey = priorityOrder.find(
      (key) => !completedSteps.includes(key),
    );

    if (!nextStepKey) {
      console.log('All steps completed.');
      return;
    }

    // Check the step key and execute custom logic for each case
    switch (nextStepKey) {
      case 'totalStartedWorkouts':
        // Call the recommendWorkouts function with no tags and a count of 1
        this.workoutsService
          .recommendWorkouts([], 1)
          .subscribe((recommendedWorkouts) => {
            if (recommendedWorkouts && recommendedWorkouts.data.length > 0) {
              const workoutId = recommendedWorkouts.data[0].id;
              console.log('Navigating to recommended workout:', workoutId);
              this.router.navigate([`dashboard/workout/${workoutId}`]);
            }
          });
        break;

      case 'totalCompletedWorkouts':
        // Fetch the latest started workout and navigate to its details
        const latestWorkout =
          await this.workoutsProgressService.getLatestStartedWorkout();
        if (latestWorkout?.['workout']) {
          const workoutId = latestWorkout['workout'].id;
          console.log('Navigating to latest started workout:', workoutId);
          this.router.navigate([`dashboard/workout/${workoutId}`]);
        }
        break;

      // Handle other cases for level and category as needed
      case 'beginner':
      case 'intermediate':
      case 'advanced':
      case 'categories':
        console.log(`Handle ${nextStepKey} action...`);
        break;

      default:
        console.log('No matching action found for step:', nextStepKey);
        break;
    }
  }
}
