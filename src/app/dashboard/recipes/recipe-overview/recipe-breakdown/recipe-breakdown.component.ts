/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recipe-breakdown',
  standalone: true,
  imports: [CommonModule, MatExpansionModule, MatIconModule, MatButtonModule],
  templateUrl: './recipe-breakdown.component.html',
  styleUrl: './recipe-breakdown.component.scss',
})
export class RecipeBreakdownComponent {
  @Input() recipe: any;
  @Input() startedRecipe: any;

  constructor(private router: Router) {}

  getSectionIcon(): string {
    if (this.startedRecipe.status === 'completed') {
      return 'check-round'; // Completed
    } else if (this.startedRecipe?.progress?.prepComplete) {
      return 'progress'; // In-progress
    } else {
      return 'more-horiz'; // Not started
    }
  }

  getPrepIcon(): string {
    if (this.startedRecipe?.progress?.prepComplete) {
      return 'check-round'; // Completed
    } else {
      return 'progress'; // In-progress
    }
  }

  navigateToSection(): void {
    this.router.navigate([
      `/dashboard/recipe/${this.startedRecipe.recipe.id}/instructions`,
    ]);
  }
}
