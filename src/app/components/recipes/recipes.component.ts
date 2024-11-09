/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { getDoc } from '@angular/fire/firestore';
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
import { RecipesService } from '@services/recipes.service';
import { TimeUtils } from '@services/time.utils';
import { UserService } from '@services/user.service'; // Import the UserService
import { combineLatest, from, Observable, of } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';
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
  styleUrls: ['./recipes.component.scss'],
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
    private userService: UserService, // Inject the user service
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

    this.recommendedRecipes$ = combineLatest([
      this.userService.getUserDocRefAsObs().pipe(
        switchMap((userRef) =>
          from(getDoc(userRef!)).pipe(
            map((doc: any) => {
              const dietNutrition = doc.exists()
                ? doc.data().dietNutrition || {}
                : {};
              return [
                ...(dietNutrition.nutritionCategories || []),
                ...(dietNutrition.recipeTags || []),
              ];
            }),
          ),
        ),
      ),
      this.startedRecipes$.pipe(
        map((startedRecipes) =>
          startedRecipes.reduce(
            (acc: string[], recipe: any) =>
              acc.concat(recipe.recipe.tags || []),
            [],
          ),
        ),
      ),
    ]).pipe(
      switchMap(([userTags, startedRecipeTags]) => {
        const combinedTags = [
          ...new Set([...userTags, ...startedRecipeTags]),
        ].slice(0, 30); // Limit to 30 tags

        return this.recipesService.recommendRecipes(combinedTags, 5).pipe(
          map((recommendedRecipes) =>
            recommendedRecipes.data.filter(
              (recipe: any) => !startedRecipeTags.includes(recipe.id),
            ),
          ),
          catchError((error) => {
            console.error('Error fetching recommended recipes:', error);
            return of([]); // Return an empty array in case of error
          }),
          finalize(() => {
            this.isLoadingRecommended = false; // Reset loading state
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
