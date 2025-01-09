import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { RecipesService } from '@services/recipes.service';
import { selectStartedRecipe } from '@store/started-recipe/started-recipe.selectors';
import {
  catchError,
  finalize,
  map,
  Observable,
  of,
  Subscription,
  take,
} from 'rxjs';
import { LoadingCarouselComponent } from '../../../components/loading-carousel/loading-carousel.component';
import { RecipesCarouselComponent } from '../recipes-carousel/recipes-carousel.component';
import { RecipeIntroComponent } from './recipe-intro/recipe-intro.component';
import { RecipeStatsComponent } from './recipe-stats/recipe-stats.component';
import { RecipeBreakdownComponent } from "./recipe-breakdown/recipe-breakdown.component";

@Component({
  selector: 'app-recipe-overview',
  standalone: true,
  imports: [
    RecipeIntroComponent,
    LoadingCarouselComponent,
    CommonModule,
    RecipesCarouselComponent,
    MatIconModule,
    MatButtonModule,
    RecipeStatsComponent,
    RecipeBreakdownComponent
],
  templateUrl: './recipe-overview.component.html',
  styleUrl: './recipe-overview.component.scss',
})
export class RecipeOverviewComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = []; // Array to store subscriptions

  recipe: any;
  recommendedRecipes: any[] = [];
  isLoadingRecommendedRecipes = true;
  startedRecipe$: Observable<any | null> | undefined; // Observable to get the started recipe
  isMobile = false;
  isTablet = false;

  constructor(
    private route: ActivatedRoute,
    private recipesService: RecipesService,
    private store: Store,
    private router: Router,
    private breakpointObserver: BreakpointObserver,
  ) {}

  ngOnInit(): void {
    // Initialize startedRecipe$ observable from the store
    this.startedRecipe$ = this.store.select(selectStartedRecipe);
    this.recipe = this.route.snapshot.data['recipe'];
    this.subscriptions.push(
      this.breakpointObserver
        .observe([Breakpoints.XSmall, Breakpoints.Small])
        .subscribe((result) => {
          const breakpoints = result.breakpoints;
          this.isMobile = !!breakpoints[Breakpoints.XSmall];
          this.isTablet = !!breakpoints[Breakpoints.Small];
        }),
    );
    this.loadRecommendedRecipes();
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  loadRecommendedRecipes(): void {
    this.subscriptions.push(
      this.recipesService
        .recommendRecipes(this.recipe.tags, 3)
        .pipe(
          take(1),
          map((response) => {
            this.recommendedRecipes = response.data || [];
            this.isLoadingRecommendedRecipes = false;
          }),
          catchError((error) => {
            console.error('Error fetching recommended recipes:', error);
            this.isLoadingRecommendedRecipes = false;
            return of([]);
          }),
          finalize(() => {
            this.isLoadingRecommendedRecipes = false;
          }),
        )
        .subscribe(),
    );
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
}
