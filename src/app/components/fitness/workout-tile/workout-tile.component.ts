/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { Router } from '@angular/router';
import { FitnessWorkoutsService } from '../../../services/fitness.service';

@Component({
  selector: 'app-workout-tile',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatChipsModule, MatButtonModule],
  templateUrl: './workout-tile.component.html',
  styleUrl: './workout-tile.component.scss',
})
export class WorkoutTileComponent {
  @Input() workout!: any;

  constructor(
    private router: Router,
    private workoutsService: FitnessWorkoutsService,
  ) {}

  async startWorkout(workoutId: string): Promise<void> {
    try {
      // Add the workout start information to Firestore using the service
      await this.workoutsService.addWorkoutStart(this.workout);

      // Navigate to the workout dashboard
      this.router.navigate(['dashboard/workout', workoutId]);
    } catch (error: any) {
      console.error('Failed to start workout:', error);
    }
  }
}
