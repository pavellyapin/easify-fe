/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { LoadingNavComponent } from '@components/loading-nav/loading-nav.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-workout-nav',
  standalone: true,
  imports: [CommonModule, MatIconModule, LoadingNavComponent],
  templateUrl: './workout-nav.component.html',
  styleUrl: './workout-nav.component.scss',
})
export class WorkoutNavComponent implements OnInit, OnDestroy {
  @Input() routine: any;
  @Input() loading: any = false;
  @Input() startedWorkout: any;
  currentExerciseIndex: number | null = null;
  private subscriptions: Subscription[] = []; // Array to store subscriptions

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Subscribe to route parameters and add to subscriptions
    const routeSub = this.route.paramMap.subscribe((params) => {
      const exercise = parseInt(params.get('exercise')!, 10) - 1; // Convert to 0-based index
      this.currentExerciseIndex = exercise;
    });
    this.subscriptions.push(routeSub);
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }

  getWarmUpIcons(): string {
    if (this.startedWorkout?.progress?.warmUpComplete) {
      return 'check-round'; // Completed
    } else {
      return 'progress'; // In-progress
    }
  }

  // Helper function to determine icon for exercises based on startedWorkout progress
  getExerciseIcon() {
    if (!this.startedWorkout?.progress?.warmUpComplete) {
      return 'more-horiz'; // Not started
    } else if (
      this.startedWorkout?.progress?.warmUpComplete &&
      this.startedWorkout?.progress?.progress != 100
    ) {
      return 'progress'; // In-progress
    } else {
      return 'check-round'; // Completed
    }
  }

  toggleExercise(index: number): void {
    this.currentExerciseIndex =
      this.currentExerciseIndex === index ? null : index;
  }
}
