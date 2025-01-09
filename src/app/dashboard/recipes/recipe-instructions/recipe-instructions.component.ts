/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/use-unknown-in-catch-callback-variable */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  ActivatedRoute,
  ParamMap,
  Router,
  RouterOutlet,
} from '@angular/router';
import { Store } from '@ngrx/store';
import { selectStartedRecipe } from '@store/started-recipe/started-recipe.selectors';
import { combineLatest, Subscription } from 'rxjs';
import { RecipeNavComponent } from '../recipe-nav/recipe-nav.component';

@Component({
  selector: 'app-recipe-instructions',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    RecipeNavComponent,
    RouterOutlet,
  ],
  templateUrl: './recipe-instructions.component.html',
  styleUrl: './recipe-instructions.component.scss',
})
export class RecipeInstructionsComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];

  routine: any;
  recipe: any;
  recipeId: any;
  startedRecipe: any;
  currentIndex = 0;
  isMobile = false;
  isTablet = false;

  constructor(
    public route: ActivatedRoute,
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    private store: Store,
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      combineLatest([this.route.paramMap]).subscribe(([params]: [ParamMap]) => {
        // Resolve both subscriptions
        this.recipeId = params.get('id')!;
        this.recipe = this.route.snapshot.data['recipe'];
      }),
    );

    this.subscriptions.push(
      this.store.select(selectStartedRecipe).subscribe((startedRecipe) => {
        this.startedRecipe = startedRecipe;
      }),
    );

    this.subscriptions.push(
      this.breakpointObserver
        .observe([Breakpoints.XSmall, Breakpoints.Small])
        .subscribe((result) => {
          const breakpoints = result.breakpoints;
          this.isMobile = breakpoints[Breakpoints.XSmall] || false;
          this.isTablet = breakpoints[Breakpoints.Small] || false;
        }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }

  navigateToBreadcrumb(destination: string): void {
    switch (destination) {
      case 'home':
        this.router.navigate(['dashboard']);
        break;
      case 'recipeHub':
        this.router.navigate(['dashboard/recipes']);
        break;
      case 'recipe':
        this.router.navigate([`dashboard/recipe/${this.recipeId}/overview`]);
        break;
      default:
        console.warn('Unrecognized breadcrumb destination:', destination);
    }
  }
}
