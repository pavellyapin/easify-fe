/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { RecipesService } from '../../../services/recipes.service';
import { selectNewRecipe } from '../../../store/recipe/recipe.selectors';

@Component({
  selector: 'app-recipe-details',
  standalone: true,
  imports: [
    CommonModule,
    SlickCarouselModule,
    MatMenuModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './recipe-details.component.html',
  styleUrl: './recipe-details.component.scss',
})
export class RecipeDetailsComponent implements OnInit {
  id!: string;
  recipe$!: Observable<any>;
  relatedRecipes: any[] = []; // Array to hold related recipes
  slideConfig = {
    slidesToShow: 3,
    slidesToScroll: 1,
    dots: true,
    infinite: false,
    autoplay: false,
  };

  constructor(
    private store: Store,
    private route: ActivatedRoute,
    private recipesService: RecipesService,
  ) {}

  ngOnInit(): void {
    this.recipe$ = this.route.paramMap.pipe(
      switchMap((params) => {
        this.id = params.get('id')!;
        if (this.id) {
          return this.recipesService.getRecipeById(this.id); // Fetch by ID
        } else {
          return this.store
            .select(selectNewRecipe)
            .pipe(map((result) => result.recipe)); // Use new recipe state
        }
      }),
      tap((recipe) => {
        if (recipe && recipe.tags) {
          this.fetchRelatedRecipes(recipe.tags);
        }
      }),
    );
  }

  fetchRelatedRecipes(keywords: string[]): void {
    this.recipesService
      .recommendRecipes(keywords, 5)
      .pipe(
        tap((relatedRecipes) => {
          this.relatedRecipes = relatedRecipes.data;
        }),
        catchError((error) => {
          console.error('Error fetching related recipes:', error);
          return of([]); // Handle the error, perhaps returning an empty array
        }),
      )
      .subscribe();
  }

  // New function to mark the recipe as favorite
  markAsFavorite(): void {
    this.recipesService
      .setFavoriteRecipe(this.id)
      .then(() => {
        console.log(`Recipe ${this.id} marked as favorite.`);
      })
      .catch((error) => {
        console.error('Error marking recipe as favorite:', error);
      });
  }
}
