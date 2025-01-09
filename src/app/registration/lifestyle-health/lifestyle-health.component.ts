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
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { WorkoutCategoryAutocompleteComponent } from '@dashboard/fitness/workout-category-autocomplete/workout-category-autocomplete.component';
import { WorkoutTagAutocompleteComponent } from '@dashboard/fitness/workout-tag-autocomplete/workout-tag-autocomplete.component';
import { Store } from '@ngrx/store';
import { CapitalizePipe } from '@services/capitalize.pipe';
import { FitnessWorkoutsService } from '@services/fitness.service';
import * as UserActions from '@store/user/user.action'; // Import user actions
import * as UserSelectors from '@store/user/user.selector';
import { Observable, Subscription, take } from 'rxjs';
import { CustomDayStepActionsComponent } from '../../components/step-actions/step-actions.component';

@Component({
  selector: 'app-lifestyle-health',
  standalone: true,
  imports: [
    CommonModule,
    MatInputModule,
    MatChipsModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    CapitalizePipe,
    WorkoutCategoryAutocompleteComponent,
    WorkoutTagAutocompleteComponent,
    CustomDayStepActionsComponent,
  ],
  templateUrl: './lifestyle-health.component.html',
  styleUrl: './lifestyle-health.component.scss',
})
export class LifestyleHealthComponent implements OnInit, OnDestroy {
  lifestyleHealthForm!: FormGroup; // Form group to hold all form controls
  addedWorkoutCategories: string[] = [];
  addedWorkoutTags: string[] = []; // Array for workout tags
  lifestyleHealth$: Observable<any>; // Observable for the lifestyle health state
  showHybridOptions = false;
  private subscriptions: Subscription = new Subscription(); // Subscription object to hold all subscriptions

  constructor(
    private fitnessService: FitnessWorkoutsService,
    private store: Store, // Inject the store
  ) {
    // Select the lifestyleHealth state from the store
    this.lifestyleHealth$ = this.store.select(
      UserSelectors.selectLifestyleHealth,
    );
  }

  ngOnInit(): void {
    // Initialize the form group
    this.lifestyleHealthForm = new FormGroup({
      martialStatus: new FormControl(''),
      family: new FormControl(''),
    });

    // Prepopulate form with existing lifestyleHealth data if available in the store
    const lifestyleHealthSub = this.lifestyleHealth$
      .pipe(take(1))
      .subscribe((lifestyleHealth) => {
        if (lifestyleHealth) {
          this.lifestyleHealthForm.patchValue(lifestyleHealth);
          // Populate addedWorkoutCategories and addedWorkoutTags from state
          this.addedWorkoutCategories =
            lifestyleHealth.workoutCategories || this.addedWorkoutCategories;
          this.addedWorkoutTags =
            lifestyleHealth.workoutTags || this.addedWorkoutTags;
        }
      });

    // Add this subscription to the subscriptions object
    this.subscriptions.add(lifestyleHealthSub);

    // Fetch workout categories and populate the added categories
    const categoriesSub = this.fitnessService
      .getAllWorkoutCategories()
      .subscribe((tags) => {
        if (this.addedWorkoutCategories.length === 0) {
          this.addedWorkoutCategories = this.getRandomTags(tags, 3); // Populate with 3 random categories
        }
      });

    // Add this subscription to the subscriptions object
    this.subscriptions.add(categoriesSub);

    // Fetch workout tags and populate the added tags
    const tagsSub = this.fitnessService
      .getAllWorkoutTags()
      .subscribe((tags) => {
        if (this.addedWorkoutTags.length === 0) {
          this.addedWorkoutTags = this.getRandomTags(tags, 3); // Populate with 3 random tags
        }
      });

    // Add this subscription to the subscriptions object
    this.subscriptions.add(tagsSub);
  }

  // Handle workout category added from autocomplete
  onCategoryAdded(tag: string): void {
    // Check if the tag is valid (i.e., non-empty) and not already in the list
    if (tag && !this.addedWorkoutCategories.includes(tag)) {
      // Add the new tag to the array using immutability
      this.addedWorkoutCategories = [...this.addedWorkoutCategories, tag];
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
    }
  }

  // Handle workout tag added from autocomplete
  onWorkoutTagAdded(tag: string): void {
    // Check if the tag is valid (i.e., non-empty) and not already in the list
    if (tag && !this.addedWorkoutTags.includes(tag)) {
      // Add the new tag to the array using immutability
      this.addedWorkoutTags = [...this.addedWorkoutTags, tag];
    } else {
      console.log('Workout tag already exists or is invalid.');
    }
  }

  // Remove workout tag from addedWorkoutTags array
  removeWorkoutTag(tag: string): void {
    const index = this.addedWorkoutTags.indexOf(tag);
    if (index >= 0) {
      this.addedWorkoutTags = [
        ...this.addedWorkoutTags.slice(0, index),
        ...this.addedWorkoutTags.slice(index + 1),
      ];
    }
  }

  // Function to get a random sample of tags
  getRandomTags(tags: string[], count = 3): string[] {
    const top20Tags = tags.slice(0, 20); // Only take the top 20
    return top20Tags.sort(() => 0.5 - Math.random()).slice(0, count);
  }

  // Add this function to your LifestyleHealthComponent class
  resetForm(): void {
    // Reset the form to its initial state
    this.lifestyleHealthForm.reset({
      martialStatus: '',
      family: '',
    });

    // Clear the added workout categories and tags
    this.addedWorkoutCategories = [];
    this.addedWorkoutTags = [];
  }

  // Handle form submission
  onSubmit(): void {
    if (this.lifestyleHealthForm.valid) {
      const lifestyleHealth = {
        ...this.lifestyleHealthForm.value,
        workoutCategories: this.addedWorkoutCategories,
        workoutTags: this.addedWorkoutTags, // Include the workout tags
      };

      // Dispatch the setLifestyleHealth action with the form data
      this.store.dispatch(UserActions.setLifestyleHealth({ lifestyleHealth }));
    } else {
      console.log('Form is invalid');
    }
  }

  // Unsubscribe from all subscriptions when the component is destroyed
  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe(); // Unsubscribe from all
    }
  }
}
