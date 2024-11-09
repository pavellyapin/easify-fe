/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @angular-eslint/sort-lifecycle-methods */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-call */
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
import { CoursesService } from '@services/courses.service';
import { FinancialPlansService } from '@services/financial.service';
import { FitnessWorkoutsService } from '@services/fitness.service';
import { GrowthService } from '@services/growth.service';
import { RecipesService } from '@services/recipes.service';
import { TimeUtils } from '@services/time.utils';
import { Subscription } from 'rxjs';
import { ItemType } from '../../models/schedule.models';
import { LoadingChipsComponent } from './loading-chips/loading-chips.component';

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
    LoadingChipsComponent,
  ],
  templateUrl: './timeslot.component.html',
  styleUrl: './timeslot.component.scss',
})
export class TimeslotComponent implements OnInit, OnChanges, OnDestroy {
  @Input() item: any;
  @Input() currentIndex!: number;
  @Input() itemIndex!: number;

  localRecommendedRecipes: any[] = [];
  localRecommendedCourses: any[] = [];
  localRecommendedWorkouts: any[] = [];
  localRecommendedFinancialPlans: any[] = [];
  localRecommendedIndustries: any[] = [];
  isLoading = false;
  enableRecommendations = false;

  private recipeSubscription: Subscription = new Subscription();
  private coursesSubscription: Subscription = new Subscription();
  private workoutsSubscription: Subscription = new Subscription();
  private industriesSubscription: Subscription = new Subscription();
  private financialPlansSubscription: Subscription = new Subscription();

  constructor(
    private router: Router,
    public timeUtils: TimeUtils,
    private recipeService: RecipesService,
    private coursesService: CoursesService,
    private workoutsService: FitnessWorkoutsService,
    private financialPlanningService: FinancialPlansService,
    private growthService: GrowthService,
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
    if (
      this.enableRecommendations &&
      this.currentIndex === this.itemIndex &&
      this.item?.tags
    ) {
      this.isLoading = true;
      const fetchTasks = [];

      // Use enum to handle different types
      switch (this.item.type) {
        case ItemType.Physical:
          fetchTasks.push(this.fetchWorkouts());
          break;
        case ItemType.Work:
          fetchTasks.push(this.fetchCourses());
          fetchTasks.push(this.fetchIndustries());
          break;
        case ItemType.Learn:
          fetchTasks.push(this.fetchCourses());
          break;
        case ItemType.Meal:
          fetchTasks.push(this.fetchRecipes());
          break;
        case ItemType.Plan:
          fetchTasks.push(this.fetchFinancialPlans());
          fetchTasks.push(this.fetchIndustries());
          break;
        // You can handle more cases as necessary
      }

      Promise.all(fetchTasks).finally(() => {
        this.isLoading = false;
      });
    }
  }

  public onFabClick(sections: any) {
    console.log(sections);
  }

  private fetchRecipes(): Promise<void> {
    this.recipeSubscription.unsubscribe();
    return new Promise<void>((resolve) => {
      this.recipeSubscription = this.recipeService
        .recommendRecipes([], 5)
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

  private fetchWorkouts(): Promise<void> {
    this.workoutsSubscription.unsubscribe();
    return new Promise<void>((resolve) => {
      this.workoutsSubscription = this.workoutsService
        .recommendWorkouts(this.item.tags, 5)
        .subscribe(
          (workouts) => {
            this.localRecommendedWorkouts = workouts?.data || [];
            resolve();
          },
          (error) => {
            console.error('Error fetching recommended workouts:', error);
            this.localRecommendedWorkouts = [];
            resolve();
          },
        );
    });
  }

  private fetchIndustries(): Promise<void> {
    this.industriesSubscription.unsubscribe();
    return new Promise<void>((resolve) => {
      this.industriesSubscription = this.growthService
        .recommendIndustries(this.item.tags, 5)
        .subscribe(
          (industries) => {
            this.localRecommendedIndustries = industries?.data || [];
            resolve();
          },
          (error) => {
            console.error('Error fetching recommended industries:', error);
            this.localRecommendedIndustries = [];
            resolve();
          },
        );
    });
  }

  private fetchFinancialPlans(): Promise<void> {
    this.financialPlansSubscription.unsubscribe();
    return new Promise<void>((resolve) => {
      this.financialPlansSubscription = this.financialPlanningService
        .recommendPlans(this.item.tags, 5)
        .subscribe(
          (plans) => {
            this.localRecommendedFinancialPlans = plans?.data || [];
            resolve();
          },
          (error) => {
            console.error('Error fetching recommended financial plans:', error);
            this.localRecommendedFinancialPlans = [];
            resolve();
          },
        );
    });
  }

  // Navigation Functions

  viewRecipe(recipeId: string): void {
    this.router.navigate(['dashboard/recipe', recipeId]);
  }

  viewCourse(courseId: string): void {
    this.router.navigate(['dashboard/course', courseId]);
  }

  viewWorkout(workoutId: string): void {
    this.router.navigate(['dashboard/workout', workoutId]);
  }

  viewFinancialPlan(planId: string): void {
    this.router.navigate(['dashboard/financial-plan', planId]);
  }

  viewIndustry(industryId: string): void {
    this.router.navigate(['dashboard/industry', industryId]);
  }

  ngOnDestroy(): void {
    this.recipeSubscription.unsubscribe();
    this.coursesSubscription.unsubscribe();
    this.workoutsSubscription.unsubscribe();
    this.industriesSubscription.unsubscribe();
    this.financialPlansSubscription.unsubscribe();
  }
}
