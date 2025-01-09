/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-workout-table-of-contents',
  standalone: true,
  imports: [CommonModule, MatExpansionModule, MatIconModule, MatButtonModule],
  templateUrl: './workout-breakdown.component.html',
  styleUrl: './workout-breakdown.component.scss',
})
export class WorkoutBreakdownComponent {
  @Input() workout: any;
  @Input() startedWorkout: any;

  constructor(private router: Router) {}

  getSectionIcon(): string {
    if (this.startedWorkout.status === 'completed') {
      return 'check-round'; // Completed
    } else if (this.startedWorkout?.progress?.warmUpComplete) {
      return 'progress'; // In-progress
    } else {
      return 'more-horiz'; // Not started
    }
  }

  getWarmUpIcons(): string {
    if (this.startedWorkout?.progress?.warmUpComplete) {
      return 'check-round'; // Completed
    } else {
      return 'progress'; // In-progress
    }
  }

  navigateToSection(): void {
    this.router.navigate([
      `/dashboard/workout/${this.startedWorkout.workout.id}/routine`,
    ]);
  }
}
