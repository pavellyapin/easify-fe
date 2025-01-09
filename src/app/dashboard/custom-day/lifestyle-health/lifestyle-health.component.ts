/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { WorkoutCategoryAutocompleteComponent } from '@dashboard/fitness/workout-category-autocomplete/workout-category-autocomplete.component';
import { Store } from '@ngrx/store';
import { CapitalizePipe } from '@services/capitalize.pipe';
import * as ScheduleActions from '@store/schedule/schedule.actions';
import * as ScheduleSelectors from '@store/schedule/schedule.selectors';
import * as UserSelectors from '@store/user/user.selector';
import { combineLatest, Subscription, take } from 'rxjs';
import { CustomDayStepActionsComponent } from '../../../components/step-actions/step-actions.component';

@Component({
  selector: 'app-custom-day-lifestyle-health',
  standalone: true,
  imports: [
    CommonModule,
    MatInputModule,
    MatChipsModule,
    MatIconModule,
    MatRadioModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    FormsModule,
    CapitalizePipe,
    WorkoutCategoryAutocompleteComponent,
    CustomDayStepActionsComponent,
  ],
  templateUrl: './lifestyle-health.component.html',
  styleUrl: './lifestyle-health.component.scss',
})
export class CustomDayLifestyleHealthComponent implements OnInit, OnDestroy {
  lifestyleHealthForm!: FormGroup; // Form group to hold all form controls
  addedWorkoutCategories: string[] = [];
  private subscriptions: Subscription[] = []; // Subscription object to hold all subscriptions

  constructor(
    private store: Store, // Inject the store
  ) {}

  ngOnInit(): void {
    // Initialize the form group
    this.lifestyleHealthForm = new FormGroup({
      additionalInfo: new FormControl(''),
    });

    // Combine customDayRequest$ and lifestyleHealth$ streams
    const combinedSub = combineLatest([
      this.store.select(ScheduleSelectors.selectCustomDayRequest).pipe(take(1)),
      this.store.select(UserSelectors.selectLifestyleHealth).pipe(take(1)),
    ]).subscribe(([customDayRequest, lifestyleHealth]) => {
      if (customDayRequest?.healthLifestyle) {
        const { additionalInfo, workoutCategories } =
          customDayRequest.healthLifestyle;
        this.lifestyleHealthForm.patchValue({
          additionalInfo: additionalInfo || '',
        });
        this.addedWorkoutCategories = workoutCategories || [];
      } else if (lifestyleHealth) {
        this.lifestyleHealthForm.patchValue({
          additionalInfo: lifestyleHealth.additionalInfo || '',
        });
        this.addedWorkoutCategories = lifestyleHealth.workoutCategories || [];
      }
    });

    this.subscriptions.push(combinedSub);
  }

  // Function to reset the form fields and workout categories
  resetForm(): void {
    this.lifestyleHealthForm.reset({
      additionalInfo: '',
    });
    this.addedWorkoutCategories = [];
  }

  // Handle workout category added from autocomplete
  onCategoryAdded(tag: string): void {
    // Check if the tag is valid (i.e., non-empty) and not already in the list
    if (tag && !this.addedWorkoutCategories.includes(tag)) {
      // Add the new tag to the array using immutability
      this.addedWorkoutCategories = [...this.addedWorkoutCategories, tag];
      console.log('Workout category added:', tag);
    } else {
      console.log('Workout category already exists or is invalid.');
    }
  }

  // Remove category from addedWorkoutCategories array
  removeCategory(tag: string): void {
    const index = this.addedWorkoutCategories.indexOf(tag);
    if (index >= 0) {
      this.addedWorkoutCategories = [
        ...this.addedWorkoutCategories.slice(0, index),
        ...this.addedWorkoutCategories.slice(index + 1),
      ];
      console.log('Workout category removed:', tag);
    }
  }

  // Handle form submission
  onSubmit(): void {
    if (this.lifestyleHealthForm.valid) {
      const lifestyleHealth = {
        ...this.lifestyleHealthForm.value,
        workoutCategories: this.addedWorkoutCategories,
      };

      // Dispatch the action to update the lifestyle health in the custom day request
      this.store.dispatch(
        ScheduleActions.updateCustomDayHealthLifestyle({ lifestyleHealth }),
      );
    } else {
      console.log('Form is invalid');
    }
  }

  // Unsubscribe from all subscriptions when the component is destroyed
  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }
}
