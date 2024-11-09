/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { CuisineAutocompleteComponent } from '@components/recipes/cuisine-autocomplete/cuisine-autocomplete.component';
import { Store } from '@ngrx/store';
import { CapitalizePipe } from '@services/capitalize.pipe';
import { ScheduleService } from '@services/schedule.service';
import * as ScheduleActions from '@store/schedule/schedule.actions';
import * as ScheduleSelectors from '@store/schedule/schedule.selectors';
import * as UserSelectors from '@store/user/user.selector';
import { combineLatest, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { CustomDayStepActionsComponent } from '../step-actions/step-actions.component';

@Component({
  selector: 'app-custom-day-diet-nutrition',
  standalone: true,
  imports: [
    CommonModule,
    MatInputModule,
    MatChipsModule,
    MatIconModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    FormsModule,
    CapitalizePipe,
    CuisineAutocompleteComponent,
    CustomDayStepActionsComponent,
  ],
  templateUrl: './diet-nutrition.component.html',
  styleUrl: './diet-nutrition.component.scss',
})
export class CustomDayDietNutritionComponent implements OnInit, OnDestroy {
  dietNutritionForm!: FormGroup; // Form group to hold all form controls
  addedNutritionCategories: string[] = [];
  private subscriptions: Subscription[] = []; // Collect all subscriptions

  constructor(
    private store: Store, // Inject the store
    private scheduleService: ScheduleService,
  ) {}

  ngOnInit(): void {
    // Initialize the form group
    this.dietNutritionForm = new FormGroup({
      additionalInfo: new FormControl(''),
    });
    // Combine customDayRequest$ and dietNutrition$ streams
    const combinedSub = combineLatest([
      this.store.select(ScheduleSelectors.selectCustomDayRequest).pipe(take(1)),
      this.store.select(UserSelectors.selectDietNutrition).pipe(take(1)),
    ]).subscribe(([customDayRequest, dietNutrition]) => {
      if (customDayRequest.dietNutrition) {
        const { additionalInfo, nutritionCategories } =
          customDayRequest.dietNutrition;
        this.dietNutritionForm.patchValue({
          additionalInfo: additionalInfo || '',
        });
        this.addedNutritionCategories = nutritionCategories || [];
      } else if (dietNutrition) {
        this.dietNutritionForm.patchValue({
          additionalInfo: dietNutrition.additionalInfo || '',
        });
        this.addedNutritionCategories = dietNutrition.nutritionCategories || [];
      }
    });

    this.subscriptions.push(combinedSub);
  }

  // Function to reset the form fields and nutrition categories
  resetForm(): void {
    this.dietNutritionForm.reset({
      additionalInfo: '',
    });
    this.addedNutritionCategories = [];
  }

  // Handle nutrition category added from autocomplete
  onCategoryAdded(tag: string): void {
    // Check if the tag is valid (i.e., non-empty) and not already in the list
    if (tag && !this.addedNutritionCategories.includes(tag)) {
      // Add the new tag to the array using immutability
      this.addedNutritionCategories = [...this.addedNutritionCategories, tag];
      console.log('Nutrition category added:', tag);
    } else {
      console.log('Nutrition category already exists or is invalid.');
    }
  }

  // Remove nutrition category from addedNutritionCategories array
  removeCategory(tag: string): void {
    const index = this.addedNutritionCategories.indexOf(tag);
    if (index >= 0) {
      this.addedNutritionCategories = [
        ...this.addedNutritionCategories.slice(0, index),
        ...this.addedNutritionCategories.slice(index + 1),
      ];
    }
  }

  // Handle form submission
  onSubmit(): void {
    if (this.dietNutritionForm.valid) {
      const dietNutrition = {
        ...this.dietNutritionForm.value,
        nutritionCategories: this.addedNutritionCategories,
      };

      // Dispatch the action to update diet nutrition in the custom day request
      this.store.dispatch(
        ScheduleActions.updateCustomDayDietNutrition({ dietNutrition }),
      );

      console.log('Form Submitted', dietNutrition);
    } else {
      console.log('Form is invalid');
    }
  }

  // Handle form submission
  onGenerate(): void {
    this.onSubmit();
    this.scheduleService.submitCustomDayRequest();
  }

  // Unsubscribe from all subscriptions when the component is destroyed
  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }
}
