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
import { WorkoutsProgressService } from '@services/workouts-progress.service';
import * as StartedWorkoutActions from '@store/started-workout/started-workout.actions';
import {
  selectEasifyWorkoutResponses,
  selectStartedWorkout,
} from '@store/started-workout/started-workout.selectors';
import {
  SlickCarouselComponent,
  SlickCarouselModule,
} from 'ngx-slick-carousel';
import { Subscription, combineLatest, map } from 'rxjs';

@Component({
  selector: 'app-workout-instructions-content',
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
  templateUrl: './workout-instructions-content.component.html',
  styleUrl: './workout-instructions-content.component.scss',
})
export class WorkoutInstructionsContentComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];

  routine: any;
  workout: any;
  workoutId: any;
  workoutStage: any;
  startedWorkout: any;
  currentIndex = 0;
  workoutComplete = false;
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
    private workoutProgressService: WorkoutsProgressService,
    private store: Store,
    private easifyService: EasifyService,
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.store.select(selectStartedWorkout).subscribe((startedWorkout) => {
        this.startedWorkout = startedWorkout;
      }),
    );

    this.subscriptions.push(
      combineLatest([
        this.store.select(selectEasifyWorkoutResponses),
        this.route.paramMap,
        this.route.parent?.paramMap || [],
      ])
        .pipe(
          map(([responses, params, parentParams]) => {
            this.initLoading = true;
            // Resolve both subscriptions
            this.workoutId = parentParams.get('id')!;
            const parentData = this.route.parent?.snapshot.data;
            this.workout = parentData!['workout'];

            this.workoutStage = parseInt(params.get('stage') || '1', 10);
            this.currentIndex = parseInt(params.get('point') || '1', 10) - 1;

            this.checkAccess();

            if (this.workoutStage === 2) {
              this.initializeComponent(this.workout.routine);
            } else {
              this.initializeComponent(this.workout.warmUp);
            }
            // Update `hasResponse` flag for points with Easify responses
            this.routine.exercises = this.routine.exercises.map(
              (step: any, index: number) => ({
                ...step,
                hasResponse: responses.some(
                  (response: any) =>
                    response.itemId === this.workoutId &&
                    response.request.item.stage === this.workoutStage &&
                    response.request.item.exerciseIndex === index,
                ),
              }),
            );
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
      (this.routine.exercises.length === 1 &&
        this.workoutStage === 1 &&
        !this.startedWorkout.progress.warmUpComplete) ||
      (this.routine.exercises.length === 1 &&
        this.workoutStage === 2 &&
        this.startedWorkout.progress.warmUpComplete)
    ) {
      this.updateWorkoutProgress();
    }
  }

  private checkAccess(): void {
    this.evaluateProgress();
  }

  private evaluateProgress(): void {
    this.workoutComplete = this.startedWorkout.status === 'completed';
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
    if (this.currentIndex < this.routine.exercises.length - 1) {
      this.currentIndex++;
      this.slickModal.slickNext();
      if (this.currentIndex === this.routine.exercises.length - 1) {
        if (
          (this.workoutStage === 1 &&
            !this.startedWorkout.progress.warmUpComplete) ||
          (this.workoutStage === 2 && !this.workoutComplete)
        ) {
          this.updateWorkoutProgress();
        }
      }
    } else {
      this.navigateNext();
    }
  }

  async updateWorkoutProgress(): Promise<void> {
    this.loading = true;

    try {
      await this.workoutProgressService.updateWorkoutProgress(this.workoutId, {
        progress: this.startedWorkout.progress.warmUpComplete ? 100 : 50,
        warmUpComplete: this.startedWorkout.progress.warmUpComplete
          ? this.startedWorkout.progress.warmUpComplete
          : true,
        totalExercises: this.startedWorkout.progress.totalExercises,
        completedExercises: this.startedWorkout.progress.warmUpComplete
          ? this.startedWorkout.progress.totalExercises
          : 0,
      });
      console.log('Workout progress updated successfully');
      const startedWorkout =
        await this.workoutProgressService.getStartedWorkoutById(this.workoutId);
      startedWorkout.status =
        startedWorkout.progress.progress == 100
          ? 'completed'
          : startedWorkout.status;
      this.store.dispatch(
        StartedWorkoutActions.loadStartedWorkoutSuccess({ startedWorkout }),
      );
      this.workoutComplete = this.startedWorkout.status === 'completed';
      this.loading = false;
    } catch (error) {
      console.error('Error updating workout progress:', error);
    }
  }

  navigateToBreadcrumb(destination: string): void {
    switch (destination) {
      case 'home':
        this.router.navigate(['dashboard']);
        break;
      case 'workoutHub':
        this.router.navigate(['dashboard/fitness']);
        break;
      case 'workout':
        this.router.navigate([`dashboard/workout/${this.workoutId}/overview`]);
        break;
      default:
        console.warn('Unrecognized breadcrumb destination:', destination);
    }
  }

  navigateNext(): void {
    if (this.workoutStage === 1) {
      this.router.navigate([`dashboard/workout/${this.workoutId}/routine/2/1`]);
    } else {
      this.router.navigate([`dashboard/workout/${this.workoutId}/overview`]);
    }
  }

  navigatePrevious(): void {
    if (this.workoutStage === 2) {
      this.router.navigate([`dashboard/workout/${this.workoutId}/routine/1/1`]);
    } else {
      this.router.navigate([`dashboard/workout/${this.workoutId}/overview`]);
    }
  }

  expandPoint(instructionIndex: number): void {
    const instruction = this.routine.exercises[instructionIndex];

    // Check if the point has a response
    if (instruction.hasResponse) {
      // Set initLoading to true
      this.initLoading = true;

      // Add a 3-second delay before navigating
      setTimeout(() => {
        this.initLoading = false; // Stop loading state
        this.router.navigate([
          `/dashboard/workout/${this.workoutId}/routine/${this.workoutStage}/${instructionIndex + 1}/easify`,
        ]);
      }, 3000);
    } else {
      // Proceed with Easify service call if no response exists
      this.initLoading = true;
      const request = {
        type: 'workout',
        item: {
          id: this.workoutId, // Assuming `this.workoutId` is set
          stage: this.workoutStage,
          exerciseIndex: instructionIndex,
        },
      };

      this.easifyService.expandContent(request).subscribe({
        next: async (response) => {
          console.log('Expanded content:', response);
          // Fetch Easify responses for the course
          const easifyResponses =
            await this.workoutProgressService.getEasifyResponsesByItemId(
              this.workoutId,
            );

          // Dispatch action to store Easify responses in the state
          this.store.dispatch(
            StartedWorkoutActions.loadWorkoutEasifyResponsesSuccess({
              responses: easifyResponses,
            }),
          );
          this.router.navigate([
            `/dashboard/workout/${this.workoutId}/routine/${this.workoutStage}/${instructionIndex + 1}/easify/`,
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
