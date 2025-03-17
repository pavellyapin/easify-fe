import { Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { RecipesService } from '@services/recipes.service';
import { setDashboardLoading } from '@store/loader/loading.actions';
import { setRecipeSearchResults } from '@store/recipe/recipe.actions';

@Component({
  selector: 'app-recipe-search-box',
  standalone: true,
  imports: [MatFormFieldModule, MatIconModule, MatInputModule],
  templateUrl: './recipe-search-box.component.html',
  styleUrl: './recipe-search-box.component.scss',
})
export class RecipeSearchBoxComponent {
  constructor(
    private store: Store,
    private router: Router,
    private recipesService: RecipesService,
  ) {}

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
}
