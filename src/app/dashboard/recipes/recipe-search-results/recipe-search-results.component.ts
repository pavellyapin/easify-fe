/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { LoadingCarouselComponent } from '@components/loading-carousel/loading-carousel.component';
import { Store } from '@ngrx/store';
import { CapitalizePipe } from '@services/capitalize.pipe';
import { RecipesService } from '@services/recipes.service';
import { setDashboardLoading } from '@store/loader/loading.actions';
import { setRecipeSearchResults } from '@store/recipe/recipe.actions';
import { selectRecipeSearchResults } from '@store/recipe/recipe.selectors';
import { Observable } from 'rxjs';
import { RecipeSearchBoxComponent } from '../recipe-search-box/recipe-search-box.component';
import { RecipeTileComponent } from '../recipe-tile/recipe-tile.component';

@Component({
  selector: 'app-recipe-search-results',
  standalone: true,
  imports: [
    CommonModule,
    LoadingCarouselComponent,
    RecipeTileComponent,
    MatIconModule,
    RecipeSearchBoxComponent,
    MatChipsModule,
    CapitalizePipe,
    MatButtonModule,
  ],
  templateUrl: './recipe-search-results.component.html',
  styleUrl: './recipe-search-results.component.scss',
})
export class RecipeSearchResultsComponent implements OnInit {
  searchResults$: Observable<any>;
  allRecipes: any[] = []; // Stores and emits the recipe list
  relatedCuisines: any[] = [];
  relatedIngredients: any[] = [];
  keyword!: string;
  isLoadingAll = false;
  isLoadingMore = false;
  isPanelOpen = false;
  lastRecipe = false;
  recipesLimit = 20;
  totalCount!: number;

  constructor(
    private store: Store,
    private recipesService: RecipesService,
    private router: Router,
  ) {
    this.searchResults$ = this.store.select(selectRecipeSearchResults);
  }

  ngOnInit(): void {
    this.loadInitialRecipes();
  }

  private loadInitialRecipes(): void {
    this.isLoadingAll = true;

    this.searchResults$.subscribe((recipes) => {
      this.totalCount = recipes.recipes.length;
      this.allRecipes = recipes.recipes.slice(0, this.recipesLimit);
      this.relatedCuisines = recipes.relatedCuisines;
      this.relatedIngredients = recipes.relatedIngredients;
      this.keyword = recipes.keyword;
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

  onSearchKeyword(keyword: string): void {
    keyword = keyword.trim();
    if (!keyword) {
      return; // Do nothing if search is empty
    }

    // Dispatch dashboard loading state
    this.store.dispatch(setDashboardLoading({ isLoading: true }));

    // Call the search service
    this.recipesService.recipeKeywordSearch(keyword).subscribe(
      (results) => {
        // Save results to state
        this.store.dispatch(setRecipeSearchResults({ results: results.data }));

        // Turn off the loading state
        this.store.dispatch(setDashboardLoading({ isLoading: false }));

        // Navigate to the search results page
        this.router.navigate(['/dashboard/recipe-search-results']);
      },
      (error) => {
        console.error('Error searching recipes:', error);

        // Turn off the loading state in case of an error
        this.store.dispatch(setDashboardLoading({ isLoading: false }));
      },
    );
  }

  onExplorePopularRecipes() {
    this.router.navigate(['/dashboard/recipes']);
  }

  navigateToBreadcrumb(destination: string): void {
    switch (destination) {
      case 'home':
        this.router.navigate(['dashboard']);
        break;
      case 'recipesHub':
        this.router.navigate(['dashboard/recipes']);
        break;
      default:
        console.warn('Unrecognized breadcrumb destination:', destination);
    }
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
