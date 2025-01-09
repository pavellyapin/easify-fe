/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { LoadingCarouselComponent } from '@components/loading-carousel/loading-carousel.component';
import { Store } from '@ngrx/store';
import { selectRecipeSearchResults } from '@store/recipe/recipe.selectors';
import { Observable } from 'rxjs';
import { RecipeTileComponent } from '../recipe-tile/recipe-tile.component';

@Component({
  selector: 'app-recipe-search-results',
  standalone: true,
  imports: [
    CommonModule,
    LoadingCarouselComponent,
    RecipeTileComponent,
    MatIconModule,
  ],
  templateUrl: './recipe-search-results.component.html',
  styleUrl: './recipe-search-results.component.scss',
})
export class RecipeSearchResultsComponent implements OnInit {
  searchResults$: Observable<any>;
  allRecipes: any[] = []; // Stores and emits the recipe list
  isLoadingAll = false;
  isLoadingMore = false;
  isPanelOpen = false;
  lastRecipe = false;
  recipesLimit = 20;

  constructor(private store: Store) {
    this.searchResults$ = this.store.select(selectRecipeSearchResults);
  }

  ngOnInit(): void {
    this.loadInitialRecipes();
  }

  private loadInitialRecipes(): void {
    this.isLoadingAll = true;

    this.searchResults$.subscribe((recipes) => {
      this.allRecipes = recipes.recipes.slice(0, this.recipesLimit);
      this.lastRecipe = this.allRecipes.length >= recipes.recipes.length;
      setTimeout(() => {
        this.isLoadingAll = false;
      }, 1000); // Simulate loading timeout
    });
  }

  loadMoreRecipes(): void {
    if (this.lastRecipe) {
      this.scrollToTop();
    } else {
      this.isLoadingMore = true;
    }

    this.searchResults$.subscribe((recipes) => {
      setTimeout(() => {
        const newLimit = this.recipesLimit + 20;
        this.allRecipes = recipes.recipes.slice(0, newLimit);
        this.recipesLimit = newLimit;
        this.lastRecipe = this.allRecipes.length >= recipes.recipes.length;
        this.isLoadingMore = false;
      }, 1000); // Simulate loading timeout
    });
  }

  scrollToTop(): void {
    const scrollContainer = document.querySelector('.mat-drawer-content');
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: 0,
        behavior: 'smooth', // Enables smooth scrolling
      });
    } else {
      // Fallback to scrolling the window
      window.scrollTo({
        top: 0,
        behavior: 'smooth', // Enables smooth scrolling
      });
    }
  }
}
