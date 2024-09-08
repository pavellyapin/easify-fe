/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { catchError, map, of, Subscription } from 'rxjs';
import { CoursesService } from '../../../services/courses.service';
import { EasifyService } from '../../../services/easify.service';
import { RecipesService } from '../../../services/recipes.service';
import { TimeUtils } from '../../../services/time.utils';
import { setLoading } from '../../../store/loader/loading.actions';
import {
  loadNewRecipeFailure,
  loadNewRecipeSuccess,
} from '../../../store/recipe/recipe.actions';

@Component({
  selector: 'app-timeslot',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './timeslot.component.html',
  styleUrls: ['./timeslot.component.scss'],
})
export class TimeslotComponent implements OnInit, OnChanges, OnDestroy {
  @Input() item: any;
  @Input() currentIndex!: number;
  @Input() itemIndex!: number;

  localRecommendedRecipes: any[] = [];
  localRecommendedCourses: any[] = [];
  isLoading: boolean = false;

  private recipeSubscription: Subscription = new Subscription();
  private coursesSubscription: Subscription = new Subscription();

  constructor(
    private store: Store,
    private chatService: EasifyService,
    private router: Router,
    public timeUtils: TimeUtils,
    private recipeService: RecipesService,
    private coursesService: CoursesService,
  ) {}

  ngOnInit(): void {
    this.checkAndFetchRecommendations();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentIndex']) {
      this.checkAndFetchRecommendations();
    }
  }

  private checkAndFetchRecommendations(): void {
    if (this.currentIndex === this.itemIndex && this.item?.tags) {
      this.isLoading = true;
      const fetchTasks = [];

      if (this.item.type === 'meal') {
        fetchTasks.push(this.fetchRecipes());
      }

      fetchTasks.push(this.fetchCourses());

      Promise.all(fetchTasks).finally(() => {
        this.isLoading = false;
      });
    }
  }

  private fetchRecipes(): Promise<void> {
    this.recipeSubscription.unsubscribe();
    return new Promise<void>((resolve) => {
      this.recipeSubscription = this.recipeService
        .recommendRecipes(this.item.tags, 5)
        .subscribe(
          (recipes) => {
            this.localRecommendedRecipes = recipes?.data || [];
            resolve();
          },
          (error) => {
            console.error('Error fetching recommended recipes:', error);
            this.localRecommendedRecipes = [];
            resolve();
          },
        );
    });
  }

  private fetchCourses(): Promise<void> {
    this.coursesSubscription.unsubscribe();
    return new Promise<void>((resolve) => {
      this.coursesSubscription = this.coursesService
        .recommendCourses(this.item.tags, 5)
        .subscribe(
          (courses) => {
            this.localRecommendedCourses = courses?.data || [];
            resolve();
          },
          (error) => {
            console.error('Error fetching recommended courses:', error);
            this.localRecommendedCourses = [];
            resolve();
          },
        );
    });
  }

  startNewRecipe(mealData: any): void {
    const newRecipeReq = {
      meal: mealData.recommendations,
      servings: 1,
      level: 'easy',
    };
    this.store.dispatch(setLoading(true));
    this.chatService
      .getRecipe(newRecipeReq)
      .pipe(
        map((newRecipe) => {
          this.store.dispatch(loadNewRecipeSuccess({ newRecipe }));
          this.router.navigate(['dashboard/newRecipe']);
          return true;
        }),
        catchError((error) => {
          console.error('Error generating recipe:', error);
          this.store.dispatch(loadNewRecipeFailure({ error }));
          return of(false);
        }),
      )
      .subscribe(() => this.store.dispatch(setLoading(false)));
  }

  viewRecipe(recipeId: string): void {
    this.router.navigate(['dashboard/recipe', recipeId]);
  }

  ngOnDestroy(): void {
    this.recipeSubscription.unsubscribe();
    this.coursesSubscription.unsubscribe();
  }
}
