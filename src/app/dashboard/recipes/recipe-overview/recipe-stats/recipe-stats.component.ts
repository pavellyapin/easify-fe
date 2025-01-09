/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { SuggestedActionComponent } from '@components/suggested-action/suggested-action.component';
import { CapitalizePipe } from '@services/capitalize.pipe';
import { RecipesProgressService } from '@services/recipes-progress.service';

@Component({
  selector: 'app-recipe-stats',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    SuggestedActionComponent,
    CapitalizePipe,
    MatProgressBarModule,
  ],
  templateUrl: './recipe-stats.component.html',
  styleUrl: './recipe-stats.component.scss',
})
export class RecipeStatsComponent implements OnInit {
  @Input() recipe: any;
  @Input() startedRecipe: any;
  @Input() isMobile = false;
  @Input() isTablet = false;

  ingredientsCount = 0;
  servings = 0;
  prepTime = 0;
  cookTime = '';
  totalTime = 0; // In minutes

  constructor(
    private router: Router,
    private recipeProgressService: RecipesProgressService,
  ) {}

  ngOnInit(): void {
    if (this.recipe) {
      this.calculateStats();
    }
  }

  calculateStats(): void {
    this.ingredientsCount = this.recipe?.ingredients?.length || 0;
  }

  async initializeOrUpdateProgress(): Promise<void> {
    if (!this.startedRecipe?.progress) {
      await this.recipeProgressService.updateRecipeProgress(
        this.startedRecipe.recipe.id,
        {
          progress: 0,
          prepComplete: false,
        },
      );
    }
    this.navigateToStep();
  }

  navigateToStep(): void {
    this.router.navigate([
      'dashboard/recipe',
      this.startedRecipe.recipe.id,
      'instructions',
    ]);
  }

  completeModule() {
    console.log('Module Completed');
  }
}
