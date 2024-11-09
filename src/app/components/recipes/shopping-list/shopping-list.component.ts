/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/use-unknown-in-catch-callback-variable */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ActivatedRoute } from '@angular/router';
import { EasifyService } from '@services/easify.service';
import { RecipesService } from '@services/recipes.service';
import { IngredientsAutocompleteComponent } from '../ingredients-autocomplete/ingredients-autocomplete.component';

@Component({
  selector: 'app-shopping-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    IngredientsAutocompleteComponent,
  ],
  templateUrl: './shopping-list.component.html',
  styleUrl: './shopping-list.component.scss',
})
export class ShoppingListComponent implements OnInit {
  ingredients: { name: string; quantity: string; checked: boolean }[] = [];
  selectedIngredients: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private recipesService: RecipesService,
    private easifyService: EasifyService,
  ) {}

  ngOnInit(): void {
    // Fetch recipe by ID from the route
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.recipesService
        .getRecipeById(id)
        .then((recipe) => {
          if (recipe?.ingredients) {
            this.ingredients = recipe.ingredients.map((ingredient: any) => ({
              name: ingredient.name,
              quantity: ingredient.quantity,
              checked: true, // Default all to checked
            }));
          }
        })
        .catch((error) => {
          console.error('Error fetching recipe:', error);
        });
    }
  }

  // Add ingredient to the list
  addIngredient(ingredient: string): void {
    if (ingredient && !this.ingredients.some((i) => i.name === ingredient)) {
      this.ingredients.push({ name: ingredient, quantity: '1', checked: true });
    }
  }

  // Collect checked ingredients and send shopping list
  sendShoppingList(): void {
    const selectedIngredients = this.ingredients
      .filter((ingredient) => ingredient.checked)
      .map((ingredient) => `${ingredient.name} - ${ingredient.quantity}`);

    if (selectedIngredients.length > 0) {
      this.easifyService
        .sendShoppingList(selectedIngredients, '+14168389409')
        .subscribe({
          next: (response) => {
            console.log('Shopping list sent successfully:', response);
          },
          error: (error) => {
            console.error('Error sending shopping list:', error);
          },
        });
    } else {
      console.log('No ingredients selected.');
    }
  }
}
