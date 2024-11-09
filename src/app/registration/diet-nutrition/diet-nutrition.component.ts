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
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { CuisineAutocompleteComponent } from '@components/recipes/cuisine-autocomplete/cuisine-autocomplete.component';
import { RecipeTagAutocompleteComponent } from '@components/recipes/recipe-tag-autocomplete/recipe-tag-autocomplete.component';
import { Store } from '@ngrx/store';
import { RecipesService } from '@services/recipes.service';
import * as UserActions from '@store/user/user.action';
import * as UserSelectors from '@store/user/user.selector';
import { Observable, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-diet-nutrition',
  standalone: true,
  imports: [
    CommonModule,
    MatInputModule,
    MatChipsModule,
    MatIconModule,
    MatRadioModule,
    MatCheckboxModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    CuisineAutocompleteComponent,
    RecipeTagAutocompleteComponent,
  ],
  templateUrl: './diet-nutrition.component.html',
  styleUrl: './diet-nutrition.component.scss',
})
export class DietNutritionComponent implements OnInit, OnDestroy {
  dietNutritionForm!: FormGroup; // Form group to hold all form controls
  addedNutritionCategories: string[] = [];
  addedRecipeTags: string[] = []; // New array for recipe tags
  dietNutrition$: Observable<any>; // Observable for diet nutrition state
  private subscriptions: Subscription = new Subscription(); // Collect all subscriptions

  constructor(
    private dietNutritionService: RecipesService,
    private store: Store, // Inject the store
  ) {
    // Select the dietNutrition state from the store
    this.dietNutrition$ = this.store.select(UserSelectors.selectDietNutrition);
  }

  ngOnInit(): void {
    // Initialize the form group
    this.dietNutritionForm = new FormGroup({
      vegetarian: new FormControl(false),
      vegan: new FormControl(false),
      lactoseIntolerant: new FormControl(false),
      glutenFree: new FormControl(false),
    });

    // Prepopulate form with existing dietNutrition data if available in the store
    const dietSubscription = this.dietNutrition$
      .pipe(take(1))
      .subscribe((dietNutrition) => {
        if (dietNutrition) {
          this.dietNutritionForm.patchValue(dietNutrition);
          this.addedNutritionCategories =
            dietNutrition.nutritionCategories || this.addedNutritionCategories;
          this.addedRecipeTags =
            dietNutrition.recipeTags || this.addedRecipeTags;
        }
      });
    this.subscriptions.add(dietSubscription);

    // Fetch nutrition tags and populate the added tags
    const cuisineSubscription = this.dietNutritionService
      .getAllRecipeCuisines()
      .subscribe((tags) => {
        if (this.addedNutritionCategories.length === 0) {
          this.addedNutritionCategories = this.getRandomTags(tags, 3); // Populate with 3 random tags
        }
      });
    this.subscriptions.add(cuisineSubscription);

    // Fetch recipe tags and populate the added tags
    const recipeTagSubscription = this.dietNutritionService
      .getAllRecipeKeywords()
      .subscribe((tags) => {
        if (this.addedRecipeTags.length === 0) {
          this.addedRecipeTags = this.getRandomTags(tags, 3); // Populate with 3 random recipe tags
        }
      });
    this.subscriptions.add(recipeTagSubscription);
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

  // Handle recipe tag added from autocomplete
  onRecipeTagAdded(tag: string): void {
    // Check if the tag is valid (i.e., non-empty) and not already in the list
    if (tag && !this.addedRecipeTags.includes(tag)) {
      // Add the new tag to the array using immutability
      this.addedRecipeTags = [...this.addedRecipeTags, tag];
      console.log('Recipe tag added:', tag);
    } else {
      console.log('Recipe tag already exists or is invalid.');
    }
  }

  // Remove recipe tag from addedRecipeTags array
  removeRecipeTag(tag: string): void {
    const index = this.addedRecipeTags.indexOf(tag);
    if (index >= 0) {
      this.addedRecipeTags = [
        ...this.addedRecipeTags.slice(0, index),
        ...this.addedRecipeTags.slice(index + 1),
      ];
    }
  }

  // Function to get a random sample of tags
  getRandomTags(tags: string[], count = 3): string[] {
    const top20Tags = tags.slice(0, 20); // Only take the top 20
    return top20Tags.sort(() => 0.5 - Math.random()).slice(0, count);
  }

  // Handle form submission
  onSubmit(): void {
    if (this.dietNutritionForm.valid) {
      const dietNutrition = {
        ...this.dietNutritionForm.value,
        nutritionCategories: this.addedNutritionCategories,
        recipeTags: this.addedRecipeTags, // Include the recipe tags
      };

      // Dispatch the setDietNutrition action with the form data
      this.store.dispatch(UserActions.setDietNutrition({ dietNutrition }));

      console.log('Form Submitted', dietNutrition);
    } else {
      console.log('Form is invalid');
    }
  }

  // Unsubscribe from all subscriptions when the component is destroyed
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
