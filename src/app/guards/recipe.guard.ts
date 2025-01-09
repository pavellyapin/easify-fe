/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  UrlTree,
} from '@angular/router';
import { RecipeItem } from '@components/models/recipe.models';
import { Store } from '@ngrx/store';
import { RecipesProgressService } from '@services/recipes-progress.service';
import { RecipesService } from '@services/recipes.service';
import { setDashboardLoading } from '@store/loader/loading.actions';
import * as StartedRecipeActions from '@store/started-recipe/started-recipe.actions';

@Injectable({
  providedIn: 'root',
})
export class RecipeGuard implements CanActivate {
  constructor(
    private recipesService: RecipesService,
    private recipesProgressService: RecipesProgressService,
    private router: Router,
    private store: Store,
  ) {}

  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean | UrlTree> {
    this.store.dispatch(setDashboardLoading(true));
    const recipeId = route.paramMap.get('id')!;
    try {
      // Fetch the recipe by ID
      const recipe = await this.recipesService.getRecipeById(recipeId);

      if (!recipe) {
        // If the recipe does not exist, redirect to a 404 page or home
        console.error(`Recipe with ID ${recipeId} not found.`);
        return this.router.parseUrl('error');
      }
      route.data = { recipe };

      // Check if the user has already started the recipe
      const startedRecipe =
        await this.recipesProgressService.getStartedRecipeById(recipeId);

      if (!startedRecipe) {
        // If no started recipe is found, create a new one
        const newRecipeItem: RecipeItem = {
          id: recipeId,
          name: recipe.name,
          description: recipe.description,
          cuisine: recipe.cuisine,
          category: recipe.category,
          image: recipe.image,
          tags: recipe.tags,
          isNew: recipe.isNew ? recipe.isNew : false,
          level: recipe.level,
          totalTime: recipe.totalTime,
        };

        const progress = {
          progress: 0,
          prepComplete: false,
        };

        await this.recipesProgressService.addRecipeStart(
          newRecipeItem,
          progress,
        );
        const startedRecipe =
          await this.recipesProgressService.getStartedRecipeById(recipeId);

        // Store the new started recipe in the route's data property
        route.data = { recipe };
        // Dispatch action to store the started recipe data in the store
        this.store.dispatch(
          StartedRecipeActions.loadStartedRecipeSuccess({ startedRecipe }),
        );
        this.store.dispatch(setDashboardLoading(false));
        return true;
      }

      // Dispatch action to store the started recipe data in the store
      this.store.dispatch(
        StartedRecipeActions.loadStartedRecipeSuccess({ startedRecipe }),
      );

      // Fetch Easify responses for the recipe
      const easifyResponses =
        await this.recipesProgressService.getEasifyResponsesByItemId(recipeId);

      // Dispatch action to store Easify responses in the state
      this.store.dispatch(
        StartedRecipeActions.loadRecipeEasifyResponsesSuccess({
          responses: easifyResponses,
        }),
      );

      this.store.dispatch(setDashboardLoading(false));

      // Allow navigation
      return true;
    } catch (error) {
      console.error('Error in recipe guard:', error);
      return this.router.parseUrl('/error'); // Redirect to an error page if something goes wrong
    }
  }
}
