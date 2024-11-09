/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @angular-eslint/component-max-inline-declarations */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { routeAnimation } from '@animations/animations';
import { Actions, ofType } from '@ngrx/effects';
import * as ScheduleActions from '@store/schedule/schedule.actions'; // Import custom day actions
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-custom-day',
  templateUrl: './custom-day.component.html',
  styleUrl: './custom-day.component.scss',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatProgressBarModule,
  ],
  animations: [routeAnimation],
})
export class CustomDayComponent implements OnInit, AfterViewInit, OnDestroy {
  currentStep = 0; // Tracks the current step index
  totalSteps = 4; // Total number of steps
  loading = false;
  private actionsSubscription: Subscription = new Subscription(); // Subscription to actions stream

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private actions$: Actions, // Inject the Actions stream
  ) {}

  ngOnInit() {
    // Listen for custom day action completion and navigate to the next step
    this.actionsSubscription.add(
      this.actions$
        .pipe(
          ofType(
            ScheduleActions.updateCustomDayBasicInfo,
            ScheduleActions.updateCustomDayWorkSkills,
            ScheduleActions.updateCustomDayHealthLifestyle,
            ScheduleActions.updateCustomDayDietNutrition,
          ),
        )
        .subscribe(() => {
          this.navigateToNextStep();
        }),
    );

    // Listen for refreshScheduleSuccess to navigate to the dashboard
    this.actionsSubscription.add(
      this.actions$
        .pipe(ofType(ScheduleActions.refreshScheduleSuccess))
        .subscribe(() => {
          this.router.navigate(['/dashboard']);
          console.log(
            'Navigated to the dashboard after refreshScheduleSuccess.',
          );
        }),
    );
  }

  ngAfterViewInit() {
    // After the view is initialized, update the step and detect changes
    this.updateStepBasedOnRoute();
    this.cdr.detectChanges(); // Manually trigger change detection after view initialization
  }

  // Update currentStep based on the active route
  updateStepBasedOnRoute(): void {
    const url = this.router.url;
    if (url.includes('basic-info')) this.currentStep = 0;
    if (url.includes('work-skills')) this.currentStep = 1;
    if (url.includes('lifestyle-health')) this.currentStep = 2;
    if (url.includes('diet-nutrition')) this.currentStep = 3;
  }

  // Calculate progress value dynamically
  public getProgressValue(): number {
    return ((this.currentStep + 1) / this.totalSteps) * 100;
  }

  // Navigate to the next step relative to the parent route
  navigateToNextStep(): void {
    if (this.currentStep < this.totalSteps - 1) {
      this.currentStep++;
      this.navigateToCurrentStep();
    } else {
      // If the current step is the last step, navigate to the dashboard
      this.loading = true;
    }
  }

  // Navigate to the previous step relative to the parent route
  navigateToPreviousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.navigateToCurrentStep();
    }
  }

  // Navigate to the route based on currentStep, relative to the parent route
  navigateToCurrentStep(): void {
    const routes = [
      'basic-info',
      'work-skills',
      'lifestyle-health',
      'diet-nutrition',
    ];

    // Use relative navigation from the current route
    this.router.navigate([routes[this.currentStep]], {
      relativeTo: this.route,
    });
  }

  // Attach animation to the router outlet
  prepareRoute(outlet: RouterOutlet): boolean | string {
    return outlet.activatedRouteData['animation'] ?? '';
  }

  // Unsubscribe from the actions stream to prevent memory leaks
  ngOnDestroy(): void {
    if (this.actionsSubscription) {
      this.actionsSubscription.unsubscribe();
    }
  }
}
