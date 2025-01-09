/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CapitalizePipe } from '@services/capitalize.pipe';

@Component({
  selector: 'app-recipe-intro',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    CapitalizePipe,
    MatProgressBarModule,
  ],
  templateUrl: './recipe-intro.component.html',
  styleUrl: './recipe-intro.component.scss',
})
export class RecipeIntroComponent {
  @Input() recipe: any;
  @Input() isMobile = false;
  @Input() isTablet = false;
  @Input() startedRecipe: any;

  getRemainingPercentage(): number {
    return Math.round(100 - this.startedRecipe.progress.progress);
  }
  getIngredients(): string[] {
    const { ingredients } = this.recipe || {};
    return Array.isArray(ingredients) ? ingredients.map((ing) => ing.name) : [];
  }

  getAdditionalTips(): string[] {
    const { additionalTips } = this.recipe || {};

    if (Array.isArray(additionalTips)) {
      return additionalTips;
    }

    if (typeof additionalTips === 'string') {
      // Split the string based on "number + dot + space" pattern (e.g., "1. ", "2. ", etc.)
      return additionalTips
        .split(/(?:\d+\.\s)/)
        .filter((tip) => tip.trim().length > 0); // Remove empty entries
    }

    return [];
  }
}
