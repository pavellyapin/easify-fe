import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { TopicLoaderComponent } from '@components/topic-loader/topic-loader.component';
import { Store } from '@ngrx/store';
import { CapitalizePipe } from '@services/capitalize.pipe';
import { EasifyService } from '@services/easify.service';
import { RecipesProgressService } from '@services/recipes-progress.service';
import * as StartedRecipeActions from '@store/started-recipe/started-recipe.actions';
import {
  selectEasifyRecipesResponses,
  selectStartedRecipe,
} from '@store/started-recipe/started-recipe.selectors';
import {
  SlickCarouselComponent,
  SlickCarouselModule,
} from 'ngx-slick-carousel';
import { Subscription, combineLatest, map } from 'rxjs';

@Component({
  selector: 'app-instructions-content',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    TopicLoaderComponent,
    MatChipsModule,
    CapitalizePipe,
    SlickCarouselModule,
    MatBadgeModule,
  ],
  templateUrl: './instructions-content.component.html',
  styleUrl: './instructions-content.component.scss',
})
export class InstructionsContentComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];

  routine: any;
  recipe: any;
  recipeId: any;
  recipeStage: any;
  startedRecipe: any;
  currentIndex = 0;
  recipeComplete = false;
  loading = false;
  initLoading = false;
  slideConfig = {
    slidesToShow: 1,
    slidesToScroll: 1,
    vertical: true,
    verticalSwiping: false,
    infinite: false,
  };
  @ViewChild('slickModal') slickModal!: SlickCarouselComponent;
  isMobile = false;
  isTablet = false;

  constructor(
    public route: ActivatedRoute,
    private router: Router,
    private recipeProgressService: RecipesProgressService,
    private store: Store,
    private easifyService: EasifyService,
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.store.select(selectStartedRecipe).subscribe((startedRecipe) => {
        this.startedRecipe = startedRecipe;
      }),
    );

    this.subscriptions.push(
      combineLatest([
        this.store.select(selectEasifyRecipesResponses),
        this.route.paramMap,
        this.route.parent?.paramMap || [],
      ])
        .pipe(
          map(([responses, params, parentParams]) => {
            this.initLoading = true;
            // Resolve both subscriptions
            this.recipeId = parentParams.get('id')!;
            const parentData = this.route.parent?.snapshot.data;
            this.recipe = parentData!['recipe'];

            this.recipeStage = parseInt(params.get('stage') || '1', 10);
            this.currentIndex = parseInt(params.get('point') || '1', 10) - 1;

            this.checkAccess();

            if (this.recipeStage === 2) {
              this.initializeComponent(this.recipe.instructions);
            } else {
              this.initializeComponent(this.recipe.prepare);
            }
            // Update `hasResponse` flag for points with Easify responses
            this.routine = this.routine.map((step: any, index: number) => ({
              ...step,
              hasResponse: responses.some(
                (response: any) =>
                  response.itemId === this.recipeId &&
                  response.request.item.stage === this.recipeStage &&
                  response.request.item.instructionIndex === index,
              ),
            }));
            setTimeout(() => {
              if (this.slickModal) {
                this.slickModal.slickGoTo(this.currentIndex);
              }
            }, 300);
          }),
        )
        .subscribe(),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }

  private initializeComponent(content: any): void {
    this.initLoading = true;
    this.routine = content;
    if (
      (this.routine.length === 1 &&
        this.recipeStage === 1 &&
        !this.startedRecipe.progress.prepComplete) ||
      (this.routine.length === 1 &&
        this.recipeStage === 2 &&
        this.startedRecipe.progress.prepComplete)
    ) {
      this.updateStepProgress();
    }
  }

  private checkAccess(): void {
    this.evaluateProgress();
  }

  private evaluateProgress(): void {
    this.recipeComplete = this.startedRecipe.status === 'completed';
    setTimeout(() => {
      this.initLoading = false;
    }, 300);
  }

  goToPreviousSlide(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.slickModal.slickPrev();
    } else {
      this.navigatePrevious();
    }
  }

  goToNextSlide(): void {
    if (this.currentIndex < this.routine.length - 1) {
      this.currentIndex++;
      this.slickModal.slickNext();
      if (this.currentIndex === this.routine.length - 1) {
        if (
          (this.recipeStage === 1 &&
            !this.startedRecipe.progress.prepComplete) ||
          (this.recipeStage === 2 && !this.recipeComplete)
        ) {
          this.updateStepProgress();
        }
      }
    } else {
      this.navigateNext();
    }
  }

  async updateStepProgress(): Promise<void> {
    this.loading = true;
    try {
      await this.recipeProgressService.updateRecipeProgress(this.recipeId, {
        progress: this.startedRecipe.progress.prepComplete ? 100 : 50,
        prepComplete: this.startedRecipe.progress.prepComplete
          ? this.startedRecipe.progress.prepComplete
          : true,
      });
      console.log('Recipe progress updated successfully');
      const startedRecipe =
        await this.recipeProgressService.getStartedRecipeById(this.recipeId);
      startedRecipe.status =
        startedRecipe.progress.progress === 100
          ? 'completed'
          : startedRecipe.status;
      this.store.dispatch(
        StartedRecipeActions.loadStartedRecipeSuccess({ startedRecipe }),
      );
      this.recipeComplete = this.startedRecipe.status === 'completed';
      this.loading = false;
    } catch (error) {
      console.error('Error updating recipe progress:', error);
    }
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

  navigateNext(): void {
    if (this.recipeStage === 1) {
      this.router.navigate([
        `dashboard/recipe/${this.recipeId}/instructions/2/1`,
      ]);
    } else {
      this.router.navigate([`dashboard/recipe/${this.recipeId}/overview`]);
    }
  }

  navigatePrevious(): void {
    if (this.recipeStage === 2) {
      this.router.navigate([
        `dashboard/recipe/${this.recipeId}/instructions/1/1`,
      ]);
    } else {
      this.router.navigate([`dashboard/recipe/${this.recipeId}/overview`]);
    }
  }

  expandPoint(instructionIndex: number): void {
    const instruction = this.routine[instructionIndex];

    // Check if the point has a response
    if (instruction.hasResponse) {
      // Set initLoading to true
      this.initLoading = true;

      // Add a 3-second delay before navigating
      setTimeout(() => {
        this.initLoading = false; // Stop loading state
        this.router.navigate([
          `/dashboard/recipe/${this.recipeId}/instructions/${this.recipeStage}/${instructionIndex + 1}/easify`,
        ]);
      }, 3000);
    } else {
      // Proceed with Easify service call if no response exists
      this.initLoading = true;
      const request = {
        type: 'recipe',
        item: {
          id: this.recipeId, // Assuming `this.recipeId` is set
          stage: this.recipeStage,
          instructionIndex: instructionIndex,
        },
      };

      this.easifyService.expandContent(request).subscribe({
        next: async (response) => {
          console.log('Expanded content:', response);
          // Fetch Easify responses for the course
          const easifyResponses =
            await this.recipeProgressService.getEasifyResponsesByItemId(
              this.recipeId,
            );

          // Dispatch action to store Easify responses in the state
          this.store.dispatch(
            StartedRecipeActions.loadRecipeEasifyResponsesSuccess({
              responses: easifyResponses,
            }),
          );
          this.router.navigate([
            `/dashboard/recipe/${this.recipeId}/instructions/${this.recipeStage}/${instructionIndex + 1}/easify/`,
          ]);
          // Optionally handle the response (e.g., update UI or state)
        },
        error: (error) => {
          console.error('Error expanding content:', error);
          this.initLoading = false;
        },
      });
    }
  }
}
