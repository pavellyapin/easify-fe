/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { CapitalizePipe } from '@services/capitalize.pipe';
import { WorkoutsProgressService } from '@services/workouts-progress.service';
import { SuggestedActionComponent } from '../../../../components/suggested-action/suggested-action.component';

@Component({
  selector: 'app-workout-stats',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    SuggestedActionComponent,
    CapitalizePipe,
    MatProgressBarModule,
  ],
  templateUrl: './workout-stats.component.html',
  styleUrl: './workout-stats.component.scss',
})
export class WorkoutStatsComponent implements OnInit {
  @Input() workout: any;
  @Input() startedWorkout: any;
  @Input() isMobile = false;
  @Input() isTablet = false;

  exercisesCount = 0;
  roundsCount = 0;
  totalExercisesCount = 0;
  estimatedTime = 0; // In hours

  constructor(
    private router: Router,
    private workoutProgressService: WorkoutsProgressService,
  ) {}

  ngOnInit(): void {
    if (this.workout) {
      this.calculateStats();
    }
  }

  calculateStats(): void {
    this.exercisesCount = this.workout?.routine.exercises?.length || 0;

    this.totalExercisesCount = this.workout?.exercises
      ? this.workout.exercises.reduce((acc: number, exercise: any) => {
          return acc + (exercise.rounds ? exercise.rounds.length : 0);
        }, 0)
      : 0;

    this.roundsCount = this.workout?.exercises
      ? this.workout.exercises.reduce((acc: number, exercise: any) => {
          return acc + (exercise.rounds ? exercise.rounds.length : 0);
        }, 0)
      : 0;

    // Round the time to the nearest 0.5 or 1 hour
    this.estimatedTime = this.workout.totalTime;
  }

  // Function to round to the nearest 0.5
  roundToNearestHalf(value: number): number {
    return Math.round(value * 2) / 2;
  }

  async initializeOrUpdateProgress(): Promise<void> {
    if (!this.startedWorkout.progress) {
      await this.workoutProgressService.updateWorkoutProgress(
        this.startedWorkout.workout.id,
        {
          progress: 0,
          warmUpComplete: false,
          totalExercises: this.totalExercisesCount,
          completedExercises: 0,
        },
      );
    }
    this.navigateToExercise();
  }

  navigateToExercise(): void {
    this.router.navigate([
      'dashboard/workout',
      this.startedWorkout.workout.id,
      'routine',
    ]);
  }

  completeModule() {
    console.log('Module Completed');
  }
}
