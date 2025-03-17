/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/ban-types */
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
import { ItemType } from '@components/models/schedule.models';
import { Store } from '@ngrx/store';
import { CoursesService } from '@services/courses.service';
import { FinancialPlansService } from '@services/financial.service';
import { FitnessWorkoutsService } from '@services/fitness.service';
import { RecipesService } from '@services/recipes.service';
import { ScheduleService } from '@services/schedule.service';
import { TimeUtilsAndMore } from '@services/time.utils';
import {
  updateTodayRecommendations,
  updateTomorrowRecommendations,
} from '@store/schedule/schedule.actions';
import { Subscription } from 'rxjs';
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
  @Input() isScrolling = false; // Flag to determine if the slot is active
  @Input() scheduleId!: string;
  @Input() viewingTomorrow!: boolean;

  recommendations: any[] = [];
  isLoading = false;
  enableRecommendations = true;

  private subscriptions: Subscription[] = [];
  ItemType = ItemType;

  constructor(
    private router: Router,
    private scheduleService: ScheduleService,
    public timeUtils: TimeUtilsAndMore,
    private recipeService: RecipesService,
    private coursesService: CoursesService,
    private workoutsService: FitnessWorkoutsService,
    private financialPlanningService: FinancialPlansService,
    private store: Store,
  ) {}

  ngOnInit(): void {
    this.checkAndFetchRecommendations();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentIndex'] && !this.isScrolling) {
      this.checkAndFetchRecommendations();
    }
  }

  private checkAndFetchRecommendations = async (): Promise<void> => {
    if (
      this.enableRecommendations &&
      this.currentIndex === this.itemIndex &&
      this.item?.tags
    ) {
      this.isLoading = true;

      if (this.item.recommendedItems) {
        this.recommendations = this.item.recommendedItems;
        this.isLoading = false;
        return;
      }

      try {
        let fetchFn: Function;

        switch (this.item.type) {
          case ItemType.Hobby:
          case ItemType.Physical:
            fetchFn = this.workoutsService.recommendWorkouts.bind(
              this.workoutsService,
            );
            break;
          case ItemType.Work:
          case ItemType.Learn:
            fetchFn = this.coursesService.recommendCourses.bind(
              this.coursesService,
            );
            break;
          case ItemType.Food:
            fetchFn = this.recipeService.recommendRecipes.bind(
              this.recipeService,
            );
            break;
          case ItemType.Financial:
            fetchFn = this.financialPlanningService.recommendPortfolios.bind(
              this.financialPlanningService,
            );
            break;
          default:
            this.isLoading = false;
            return;
        }

        const response: any = await fetchFn(this.item.tags, 2).toPromise();
        this.recommendations = response?.data || [];

        if (!this.viewingTomorrow) {
          this.store.dispatch(
            updateTodayRecommendations({
              timeSlotIndex: this.itemIndex,
              recommendations: this.recommendations,
            }),
          );
        } else {
          this.store.dispatch(
            updateTomorrowRecommendations({
              timeSlotIndex: this.itemIndex,
              recommendations: this.recommendations,
            }),
          );
        }

        await this.scheduleService.saveRecommendationsToTimeSlot(
          this.scheduleId,
          this.currentIndex,
          this.recommendations,
        );
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        this.recommendations = [];
      } finally {
        this.isLoading = false;
      }
    }
  };

  // Navigation Functions
  viewItem(itemId: string): void {
    let route: string;
    switch (this.item.type) {
      case ItemType.Food:
        route = 'dashboard/recipe';
        break;
      case ItemType.Learn:
      case ItemType.Work:
        route = 'dashboard/course';
        break;
      case ItemType.Physical:
      case ItemType.Hobby:
        route = 'dashboard/workout';
        break;
      case ItemType.Financial:
        route = 'dashboard/financial-plan';
        break;
      default:
        console.warn('Unknown item type for navigation:', this.item.type);
        return;
    }
    this.router.navigate([route, itemId]);
  }

  getFabIcon(): string {
    switch (this.item.type) {
      case ItemType.Physical:
      case ItemType.Hobby:
        return 'monitor';
      case ItemType.Work:
      case ItemType.Learn:
        return 'book';
      case ItemType.Food:
        return 'chef-hat';
      case ItemType.Financial:
        return 'growth';
      default:
        return 'growth';
    }
  }

  onFabClick(type: string): void {
    console.log(`FAB clicked for type: ${type}`);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }
}
