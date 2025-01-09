/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RecipesService } from '@services/recipes.service';
import { IngredientsAutocompleteComponent } from '../ingredients-autocomplete/ingredients-autocomplete.component';
import { RecipeTileComponent } from '../recipe-tile/recipe-tile.component';

@Component({
  selector: 'app-recipe-by-ingredients',
  standalone: true,
  imports: [
    CommonModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    IngredientsAutocompleteComponent,
    MatProgressSpinnerModule,
    RecipeTileComponent,
  ],
  templateUrl: './recipe-by-ingredients.component.html',
  styleUrl: './recipe-by-ingredients.component.scss',
})
export class RecipeByIngredientsComponent {
  selectedIngredients: string[] = [];
  recipes: any[] = []; // To hold the found recipes
  isLoading = false; // Loading state
  searchPerformed = false; // To check if search was performed

  constructor(private recipesService: RecipesService) {}

  findRecipes() {
    this.isLoading = true; // Start loading
    this.searchPerformed = true;
    this.recipesService
      .findRecipesByIngredients(this.selectedIngredients)
      .subscribe(
        (recipes) => {
          this.recipes = recipes.data;
          this.isLoading = false; // End loading
        },
        (error) => {
          console.error('Error fetching recipes:', error);
          this.isLoading = false; // End loading
          this.recipes = []; // Clear previous results
        },
      );
  }

  addNewRecipe() {
    console.log('Navigating to the New Recipe page');
    // Logic to navigate to the new recipe page
  }

  addIngredient(value: any): void {
    if (value && !this.selectedIngredients.includes(value)) {
      this.selectedIngredients.push(value);
    }
  }

  removeIngredient(ingredient: string): void {
    const index = this.selectedIngredients.indexOf(ingredient);
    if (index >= 0) {
      this.selectedIngredients.splice(index, 1);
    }
  }
}
