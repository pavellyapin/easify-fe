/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { LoadingCarouselComponent } from '@components/loading-carousel/loading-carousel.component';
import { SuggestedActionComponent } from '@components/suggested-action/suggested-action.component';
import { ChallengeService } from '@services/challenges.service';
import { RecipesProgressService } from '@services/recipes-progress.service';
import { RecipesService } from '@services/recipes.service';
import { combineLatest, Observable, of, Subscription } from 'rxjs';
import { catchError, finalize, map, take } from 'rxjs/operators';
import { AllRecipesComponent } from './all-recipes/all-recipes.component';
import { RecipeSearchBoxComponent } from './recipe-search-box/recipe-search-box.component';
import { RecipesCarouselComponent } from './recipes-carousel/recipes-carousel.component';

@Component({
  selector: 'app-recipes',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    LoadingCarouselComponent,
    AllRecipesComponent,
    SuggestedActionComponent,
    RecipesCarouselComponent,
    RecipeSearchBoxComponent,
  ],
  templateUrl: './recipes.component.html',
  styleUrls: ['./recipes.component.scss'],
})
export class RecipesComponent implements OnInit, OnDestroy {
  startedRecipes$!: Observable<any[]>;
  recommendedRecipes$!: Observable<any>;
  combinedRecipes: any[] = [];
  isLoadingCombinedRecipes = true;
  firstIncompleteChallenge: any;
  isMobile = false;
  isTablet = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private recipesProgressService: RecipesProgressService,
    private recipesService: RecipesService,
    private challengesService: ChallengeService,
    private breakpointObserver: BreakpointObserver,
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.breakpointObserver
        .observe([Breakpoints.XSmall, Breakpoints.Small])
        .subscribe((result) => {
          const breakpoints = result.breakpoints;
          this.isMobile = breakpoints[Breakpoints.XSmall] ? true : false;
          this.isTablet = breakpoints[Breakpoints.Small] ? true : false;
        }),
    );

    // Fetch and normalize started recipes
    this.startedRecipes$ = this.recipesProgressService.getStartedRecipes().pipe(
      take(1),
      map((startedRecipes: any[]) =>
        startedRecipes.map((startedRecipe) => ({
          ...startedRecipe.recipe,
          progress: startedRecipe.progress,
        })),
      ),
      catchError((error) => {
        console.error('Error fetching started recipes:', error);
        return of([]);
      }),
    );

    // Fetch recommended recipes
    this.recommendedRecipes$ = this.recipesService.recommendRecipes([], 3).pipe(
      take(1),
      map((recipes) => recipes.data || []),
      catchError((error) => {
        console.error('Error fetching recommended recipes:', error);
        return of([]);
      }),
    );

    // Combine started and recommended recipes
    combineLatest([this.startedRecipes$, this.recommendedRecipes$])
      .pipe(
        map(([startedRecipes, recommendedRecipes]) => {
          this.isLoadingCombinedRecipes = false;
          return [...startedRecipes, ...recommendedRecipes];
        }),
        finalize(() => {
          this.isLoadingCombinedRecipes = false;
        }),
      )
      .subscribe((combinedRecipes) => {
        this.combinedRecipes = combinedRecipes;
      });

    // Fetch first incomplete challenge of type "culinary"
    this.loadFirstIncompleteChallenge();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  private async loadFirstIncompleteChallenge() {
    try {
      this.firstIncompleteChallenge =
        await this.challengesService.getFirstIncompleteChallengeByType(
          'culinary',
        );
    } catch (error) {
      console.error('Error loading first incomplete challenge:', error);
    }
  }

  completeRecipe() {
    console.log('Complete Recipe action triggered');
    // Add your logic here for completing the recipe
  }
}
