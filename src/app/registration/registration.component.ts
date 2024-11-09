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
import { Actions, ofType } from '@ngrx/effects';
import * as UserActions from '@store/user/user.action'; // Import actions
import { Subscription } from 'rxjs';
import { routeAnimation } from '../animations/animations';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.scss',
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
export class RegistrationComponent implements OnInit, AfterViewInit, OnDestroy {
  loading = false;
  currentStep = 0; // Tracks the current step index
  totalSteps = 7; // Total number of steps
  private actionsSubscription: Subscription = new Subscription(); // Subscription to actions stream

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private actions$: Actions, // Inject the Actions stream
  ) {}

  ngOnInit() {
    // Listen for set actions to set loading to true
    this.actionsSubscription.add(
      this.actions$
        .pipe(
          ofType(
            UserActions.setBasicInfo,
            UserActions.setWorkSkills,
            UserActions.setDietNutrition,
            UserActions.setFinancialPlanning,
            UserActions.setLifestyleHealth,
            UserActions.setMoreInfo,
            UserActions.setResume,
          ),
        )
        .subscribe(() => {
          this.loading = true;
          window.scrollTo(0, 0);
        }),
    );

    // Listen for success actions to set loading to false
    this.actionsSubscription.add(
      this.actions$
        .pipe(
          ofType(
            UserActions.setBasicInfoSuccess,
            UserActions.setWorkSkillsSuccess,
            UserActions.setDietNutritionSuccess,
            UserActions.setFinancialPlanningSuccess,
            UserActions.setLifestyleHealthSuccess,
            UserActions.setMoreInfoSuccess,
            UserActions.setResumeSuccess,
          ),
        )
        .subscribe(() => {
          this.loading = false;
          this.navigateToNextStep();
        }),
    );

    // Optionally listen for failure actions to also set loading to false
    this.actionsSubscription.add(
      this.actions$.pipe(ofType(UserActions.userError)).subscribe(() => {
        this.loading = false; // Stop loading on failure as well
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
    if (url.includes('upload-resume')) this.currentStep = 2;
    if (url.includes('lifestyle-health')) this.currentStep = 3;
    if (url.includes('diet-nutrition')) this.currentStep = 4;
    if (url.includes('financial-planning')) this.currentStep = 5;
    if (url.includes('more-info')) this.currentStep = 6;
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
      // If the current step is the last step, navigate to the profile page
      this.router.navigate(['/dashboard']);
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
      'upload-resume',
      'lifestyle-health',
      'diet-nutrition',
      'financial-planning',
      'more-info',
    ];

    // Use relative navigation from the current route
    this.router.navigate([routes[this.currentStep]], {
      relativeTo: this.route,
    });
  }

  onSubmit(): void {
    // Handle form submission logic
    console.log('Form Submitted');
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
