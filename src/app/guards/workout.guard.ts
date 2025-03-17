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
import { WorkoutItem } from '@components/models/workout.models';
import { Store } from '@ngrx/store';
import { FitnessWorkoutsService } from '@services/fitness.service';
import { WorkoutsProgressService } from '@services/workouts-progress.service';
import * as StartedWorkoutActions from '@store/started-workout/started-workout.actions';

@Injectable({
  providedIn: 'root',
})
export class WorkoutGuard implements CanActivate {
  constructor(
    private workoutsService: FitnessWorkoutsService,
    private workoutsProgressService: WorkoutsProgressService,
    private router: Router,
    private store: Store,
  ) {}

  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean | UrlTree> {
    const workoutId = route.paramMap.get('id')!;
    try {
      // Fetch the workout by ID
      const workout = await this.workoutsService.getWorkoutById(workoutId);

      if (!workout) {
        // If the workout does not exist, redirect to a 404 page or home
        console.error(`Workout with ID ${workoutId} not found.`);
        return this.router.parseUrl('error');
      }
      route.data = { workout };
      // Check if the user has already started the workout
      const startedWorkout =
        await this.workoutsProgressService.getStartedWorkoutById(workoutId);

      if (!startedWorkout) {
        // If no started workout is found, create a new one
        const newWorkoutItem: WorkoutItem = {
          id: workoutId,
          name: workout.name,
          overview: workout.overview,
          level: workout.level,
          category: workout.category,
          image: workout.image,
          tags: workout.tags,
          isNew: workout.isNew ? workout.isNew : false,
        };

        const totalExerciseCount = workout?.routine.exercises
          ? workout.routine.exercises.length
          : 0;

        const progress = {
          progress: 0,
          warmUpComplete: false,
          completeExercises: 0,
          totalExercises: totalExerciseCount,
        };

        await this.workoutsProgressService.addWorkoutStart(
          newWorkoutItem,
          progress,
        );
        const startedWorkout =
          await this.workoutsProgressService.getStartedWorkoutById(workoutId);
        // Store the new started workout in the route's data property
        route.data = { workout };
        // Dispatch action to store the started workout data in the store
        this.store.dispatch(
          StartedWorkoutActions.loadStartedWorkoutSuccess({ startedWorkout }),
        );
        return true;
      }

      // Dispatch action to store the started workout data in the store
      this.store.dispatch(
        StartedWorkoutActions.loadStartedWorkoutSuccess({ startedWorkout }),
      );

      // Fetch Easify responses for the workout
      const easifyResponses =
        await this.workoutsProgressService.getEasifyResponsesByItemId(
          workoutId,
        );

      // Dispatch action to store Easify responses in the state
      this.store.dispatch(
        StartedWorkoutActions.loadWorkoutEasifyResponsesSuccess({
          responses: easifyResponses,
        }),
      );
      // Allow navigation
      return true;
    } catch (error) {
      console.error('Error in workout guard:', error);
      return this.router.parseUrl('/error'); // Redirect to an error page if something goes wrong
    }
  }
}
