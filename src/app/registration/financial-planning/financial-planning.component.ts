/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { PlanCategoryAutocompleteComponent } from '@components/financial/plan-category-autocomplete/plan-category-autocomplete.component';
import { PlanTagsAutocompleteComponent } from '@components/financial/plan-tags-autocomplete/plan-tags-autocomplete.component';
import { Store } from '@ngrx/store';
import { FinancialPlansService } from '@services/financial.service';
import * as UserActions from '@store/user/user.action';
import * as UserSelectors from '@store/user/user.selector';
import { Observable, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-financial-planning',
  standalone: true,
  imports: [
    PlanCategoryAutocompleteComponent,
    CommonModule,
    MatInputModule,
    MatChipsModule,
    MatIconModule,
    MatRadioModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    PlanTagsAutocompleteComponent,
  ],
  templateUrl: './financial-planning.component.html',
  styleUrl: './financial-planning.component.scss',
})
export class FinancialPlanningComponent implements OnInit, OnDestroy {
  financialPlanningForm!: FormGroup; // Form group for financial planning form
  addedCategories: string[] = [];
  addedPlanTags: string[] = []; // New array for plan tags
  financialPlanning$: Observable<any>; // Observable for financial planning state
  showInvestmentOptions = false; // Toggle for showing additional investment options
  private subscriptions: Subscription = new Subscription(); // Collect all subscriptions

  constructor(
    private financialPlansService: FinancialPlansService,
    private store: Store, // Inject the store
  ) {
    // Select the financialPlanning state from the store
    this.financialPlanning$ = this.store.select(
      UserSelectors.selectFinancialPlanning,
    );
  }

  ngOnInit(): void {
    // Initialize form group with fields for financial planning
    this.financialPlanningForm = new FormGroup({});

    // Prepopulate form with existing financialPlanning data if available in the store
    const planSubscription = this.financialPlanning$
      .pipe(take(1))
      .subscribe((financialPlanning) => {
        if (financialPlanning) {
          this.financialPlanningForm.patchValue(financialPlanning);
          this.addedCategories =
            financialPlanning.planCategories || this.addedCategories;
          this.addedPlanTags = financialPlanning.planTags || this.addedPlanTags; // Populate plan tags if available
        }
      });
    this.subscriptions.add(planSubscription);

    // Fetch the plan categories and populate added categories
    const categorySubscription = this.financialPlansService
      .getAllPlanCategories()
      .subscribe((categories) => {
        if (this.addedCategories.length === 0) {
          this.addedCategories = this.getRandomCategories(categories, 3); // Populate with 3 random categories
        }
      });
    this.subscriptions.add(categorySubscription);

    // Fetch the plan tags and populate added plan tags
    const tagSubscription = this.financialPlansService
      .getAllPlanTags()
      .subscribe((tags) => {
        if (this.addedPlanTags.length === 0) {
          this.addedPlanTags = this.getRandomTags(tags, 3); // Populate with 3 random plan tags
        }
      });
    this.subscriptions.add(tagSubscription);

    // Watch for changes in planType to toggle investment options
    const planTypeSubscription = this.financialPlanningForm
      .get('planType')
      ?.valueChanges.subscribe((type) => {
        if (type === 'investment' || type === 'retirement') {
          this.showInvestmentOptions = true;
          this.financialPlanningForm.get('investmentOptions')?.enable(); // Enable investment options field
        } else {
          this.showInvestmentOptions = false;
          this.financialPlanningForm.get('investmentOptions')?.disable(); // Disable investment options field
        }
      });
    this.subscriptions.add(planTypeSubscription);
  }

  // Handle category added from autocomplete
  onCategoryAdded(category: string): void {
    // Check if the category is valid (i.e., non-empty) and not already in the list
    if (category && !this.addedCategories.includes(category)) {
      // Add the new category to the array using immutability
      this.addedCategories = [...this.addedCategories, category];
      console.log('Category added:', category);
    } else {
      console.log('Category already exists or is invalid.');
    }
  }

  // Remove category from addedCategories array
  removeCategory(category: string): void {
    const index = this.addedCategories.indexOf(category);
    if (index >= 0) {
      this.addedCategories = [
        ...this.addedCategories.slice(0, index),
        ...this.addedCategories.slice(index + 1),
      ];
    }
  }

  // Handle plan tag added from autocomplete
  onPlanTagAdded(tag: string): void {
    // Check if the tag is valid (i.e., non-empty) and not already in the list
    if (tag && !this.addedPlanTags.includes(tag)) {
      // Add the new tag to the array using immutability
      this.addedPlanTags = [...this.addedPlanTags, tag];
      console.log('Plan tag added:', tag);
    } else {
      console.log('Plan tag already exists or is invalid.');
    }
  }

  // Remove plan tag from addedPlanTags array
  removePlanTag(tag: string): void {
    const index = this.addedPlanTags.indexOf(tag);
    if (index >= 0) {
      this.addedPlanTags = [
        ...this.addedPlanTags.slice(0, index),
        ...this.addedPlanTags.slice(index + 1),
      ];
    }
  }

  // Function to get a random sample of categories
  getRandomCategories(categories: string[], count = 3): string[] {
    const top20Categories = categories.slice(0, 20); // Only take the top 20
    return top20Categories.sort(() => 0.5 - Math.random()).slice(0, count);
  }

  // Function to get a random sample of plan tags
  getRandomTags(tags: string[], count = 3): string[] {
    const top20Tags = tags.slice(0, 20); // Only take the top 20
    return top20Tags.sort(() => 0.5 - Math.random()).slice(0, count);
  }

  // Handle form submission
  onSubmit(): void {
    if (this.financialPlanningForm.valid) {
      const financialPlanning = {
        ...this.financialPlanningForm.value,
        planCategories: this.addedCategories,
        planTags: this.addedPlanTags, // Include the plan tags
      };

      // Dispatch the setFinancialPlanning action with the form data
      this.store.dispatch(
        UserActions.setFinancialPlanning({ financialPlanning }),
      );

      console.log('Form Submitted', financialPlanning);
    } else {
      console.log('Form is invalid');
    }
  }

  // Unsubscribe from all subscriptions when the component is destroyed
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
