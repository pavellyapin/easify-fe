/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { Router } from '@angular/router';
import { RecipesService } from '../../../services/recipes.service';

@Component({
  selector: 'app-recipe-tile',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatChipsModule, MatButtonModule],
  templateUrl: './recipe-tile.component.html',
  styleUrl: './recipe-tile.component.scss',
})
export class RecipeTileComponent {
  @Input() recipe!: any;

  constructor(
    private router: Router,
    private recipesService: RecipesService,
  ) {}

  async startRecipe(recipeId: string): Promise<void> {
    try {
      // Add the recipe start information to Firestore using the service
      await this.recipesService.addRecipeStart(this.recipe);

      // Navigate to the recipe dashboard
      this.router.navigate(['dashboard/recipe', recipeId]);
    } catch (error: any) {
      console.error('Failed to start recipe:', error);
    }
  }
}
