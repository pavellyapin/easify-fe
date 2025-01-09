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
  selector: 'app-recipe-nav',
  standalone: true,
  imports: [CommonModule, MatIconModule, LoadingNavComponent],
  templateUrl: './recipe-nav.component.html',
  styleUrl: './recipe-nav.component.scss',
})
export class RecipeNavComponent implements OnInit, OnDestroy {
  @Input() routine: any;
  @Input() loading: any = false;
  @Input() startedRecipe: any;
  currentStepIndex: number | null = null;
  private subscriptions: Subscription[] = []; // Array to store subscriptions

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Subscribe to route parameters and add to subscriptions
    const routeSub = this.route.paramMap.subscribe((params) => {
      const step = parseInt(params.get('step')!, 10) - 1; // Convert to 0-based index
      this.currentStepIndex = step;
    });
    this.subscriptions.push(routeSub);
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }

  getPrepIcons(): string {
    if (this.startedRecipe?.progress?.prepComplete) {
      return 'check-round'; // Completed
    } else {
      return 'progress'; // In-progress
    }
  }

  // Helper function to determine icon for steps based on startedRecipe progress
  getStepIcon(): string {
    if (!this.startedRecipe?.progress?.prepComplete) {
      return 'more-horiz'; // Not started
    } else if (
      this.startedRecipe?.progress?.prepComplete &&
      this.startedRecipe?.progress?.progress !== 100
    ) {
      return 'progress'; // In-progress
    } else {
      return 'check-round'; // Completed
    }
  }
}
