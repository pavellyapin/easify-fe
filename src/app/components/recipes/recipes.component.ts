/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';
import { RecipesService } from '../../services/recipes.service';
import { TimeUtils } from '../../services/time.utils';
import { RecipeTileComponent } from './recipe-tile/recipe-tile.component';

@Component({
  selector: 'app-recipes',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RecipeTileComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatToolbarModule,
  ],
  templateUrl: './recipes.component.html',
  styleUrl: './recipes.component.scss',
})
export class RecipesComponent implements OnInit {
  startedRecipes$!: Observable<any[]>;
  recommendedRecipes$!: Observable<any>;
  allRecipes$!: Observable<any>;
  isLoadingRecommended = false;
  isLoadingAll = false;
  allKeywords$!: Observable<string[]>; // Observable for the dropdown
  selectedKeywords: string[] = [];

  constructor(
    private recipesService: RecipesService,
    private timeUtils: TimeUtils,
  ) {}

  ngOnInit(): void {
    this.startedRecipes$ = this.recipesService.getStartedRecipes();
    this.allKeywords$ = this.recipesService.getAllRecipeKeywords();

    this.isLoadingAll = true;

    this.allKeywords$.subscribe((keywords) => {
      // Get the top 5 keywords by count (assuming keywords are sorted by count)
      this.selectedKeywords = keywords.slice(0, 6);
      this.fetchRecipesBasedOnSelectedKeywords();
    });

    // Set loading state to true before starting to fetch recommended recipes
    this.isLoadingRecommended = true;

    this.recommendedRecipes$ = this.startedRecipes$.pipe(
      switchMap((startedRecipes) => {
        // Extract IDs and keywords from started recipes
        const startedRecipeIds = startedRecipes.map(
          (recipe) => recipe.recipe.id,
        );
        const keywords = startedRecipes.reduce((acc: string[], recipe: any) => {
          return acc.concat(recipe.recipe.tags || []);
        }, []);
        return this.recipesService
          .recommendRecipes([...new Set(keywords.slice(0, 30))], 5)
          .pipe(
            map((recommendedRecipes) =>
              // Filter out the recipes that have already been started
              recommendedRecipes.data.filter(
                (recipe: any) => !startedRecipeIds.includes(recipe.id),
              ),
            ),
            catchError((error) => {
              console.error('Error fetching recommended recipes:', error);
              return of([]); // Return an empty array in case of error
            }),
            finalize(() => {
              this.isLoadingRecommended = false; // Ensure the loading state is reset
            }),
          );
      }),
    );
  }

  fetchRecipesBasedOnSelectedKeywords(): void {
    this.isLoadingAll = true; // Set loading state to true before fetching data

    if (this.selectedKeywords.length > 0) {
      this.allRecipes$ = this.recipesService
        .recommendRecipes(this.selectedKeywords, 20)
        .pipe(
          map((recipes) => recipes.data.sort(this.timeUtils.sortByCreatedDate)), // Sort by createdDate
          catchError((error) => {
            console.error('Error fetching recipes:', error);
            return of([]); // Return an empty array in case of error
          }),
          finalize(() => {
            this.isLoadingAll = false; // Ensure the loading state is reset
          }),
        );
    } else {
      this.allRecipes$ = this.recipesService.getAllRecipes().pipe(
        map((recipes) => recipes.data.sort(this.timeUtils.sortByCreatedDate)), // Sort by createdDate
        catchError((error) => {
          console.error('Error fetching recipes:', error);
          return of([]); // Return an empty array in case of error
        }),
        finalize(() => {
          this.isLoadingAll = false; // Ensure the loading state is reset
        }),
      );
    }
  }

  onKeywordSelected(keyword: string): void {
    if (!this.selectedKeywords.includes(keyword)) {
      this.selectedKeywords.push(keyword);
      this.fetchRecipesBasedOnSelectedKeywords();
    }
  }

  removeKeyword(keyword: string): void {
    const index = this.selectedKeywords.indexOf(keyword);
    if (index >= 0) {
      this.selectedKeywords.splice(index, 1);
      this.fetchRecipesBasedOnSelectedKeywords();
    }
  }
}
