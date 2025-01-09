/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { TimeUtilsAndMore } from '@services/time.utils';
import { selectEasifyWorkoutResponses } from '@store/started-workout/started-workout.selectors';
import { Subscription, combineLatest, filter, map } from 'rxjs';

@Component({
  selector: 'app-workout-easify-instruction',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './easify-workout-instruction.component.html',
  styleUrl: './easify-workout-instruction.component.scss',
})
export class EasifyWorkoutInstructionComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = []; // Array to store subscriptions
  easifyResponse: any;
  workoutId!: string;
  stage!: number;
  exerciseIndex!: number;

  constructor(
    private route: ActivatedRoute,
    private store: Store,
    public utils: TimeUtilsAndMore,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      combineLatest([
        this.store.select(selectEasifyWorkoutResponses),
        this.route.paramMap,
        this.route.parent?.paramMap || [],
      ])
        .pipe(
          filter(([responses]) => !!responses),
          map(([responses, params, parentParams]) => {
            this.workoutId = parentParams.get('id')!;
            this.stage = parseInt(
              params.get('stage') || parentParams.get('stage') || '1',
              10,
            );
            this.exerciseIndex = parseInt(params.get('point') || '1', 10);

            // Assign responses for the current point to easifyResponse
            this.easifyResponse = responses
              .filter(
                (response: any) =>
                  response.itemId === this.workoutId &&
                  response.request.item.stage === this.stage &&
                  response.request.item.exerciseIndex ===
                    this.exerciseIndex - 1,
              )
              .pop();
          }),
        )
        .subscribe(),
    );
  }

  /**
   * Navigates back to the topic route with the pointIndex as route data.
   */
  goBack(): void {
    this.router.navigate([
      `/dashboard/workout/${this.workoutId}/routine/${this.stage}/${this.exerciseIndex}`,
    ]);
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }
}
