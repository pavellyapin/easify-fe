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
import { selectEasifyRecipesResponses } from '@store/started-recipe/started-recipe.selectors';
import { Subscription, combineLatest, filter, map } from 'rxjs';

@Component({
  selector: 'app-easify-instruction',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './easify-instruction.component.html',
  styleUrl: './easify-instruction.component.scss',
})
export class EasifyInstructionComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = []; // Array to store subscriptions
  easifyResponse: any;
  recipeId!: string;
  stage!: number;
  instructionIndex!: number;

  constructor(
    private route: ActivatedRoute,
    private store: Store,
    public utils: TimeUtilsAndMore,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      combineLatest([
        this.store.select(selectEasifyRecipesResponses),
        this.route.paramMap,
        this.route.parent?.paramMap || [],
      ])
        .pipe(
          filter(([responses]) => !!responses),
          map(([responses, params, parentParams]) => {
            this.recipeId = parentParams.get('id')!;
            this.stage = parseInt(
              params.get('stage') || parentParams.get('stage') || '1',
              10,
            );
            this.instructionIndex = parseInt(params.get('point') || '1', 10);

            // Assign responses for the current point to easifyResponse
            this.easifyResponse = responses
              .filter(
                (response: any) =>
                  response.itemId === this.recipeId &&
                  response.request.item.stage === this.stage &&
                  response.request.item.instructionIndex ===
                    this.instructionIndex - 1,
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
      `/dashboard/recipe/${this.recipeId}/instructions/${this.stage}/${this.instructionIndex}`,
    ]);
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }
}
