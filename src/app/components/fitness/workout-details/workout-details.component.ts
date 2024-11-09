/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FitnessWorkoutsService } from '@services/fitness.service';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { Observable, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-workout-details',
  standalone: true,
  imports: [CommonModule, SlickCarouselModule],
  templateUrl: './workout-details.component.html',
  styleUrl: './workout-details.component.scss',
})
export class WorkoutDetailsComponent implements OnInit {
  workout$!: Observable<any>;
  relatedWorkouts: any[] = []; // Array to hold related workouts
  slideConfig = {
    slidesToShow: 3,
    slidesToScroll: 1,
    dots: true,
    infinite: false,
    autoplay: false,
  };

  constructor(
    private route: ActivatedRoute,
    private workoutsService: FitnessWorkoutsService,
  ) {}

  ngOnInit(): void {
    this.workout$ = this.route.paramMap.pipe(
      switchMap((params) => {
        const id = params.get('id');
        return this.workoutsService.getWorkoutById(id!);
      }),
      tap((workout) => {
        if (workout && workout.tags) {
          this.fetchRelatedWorkouts(workout.tags);
        }
      }),
    );
  }

  fetchRelatedWorkouts(tags: string[]): void {
    this.workoutsService
      .recommendWorkouts(tags, 5)
      .pipe(
        tap((relatedWorkouts) => {
          this.relatedWorkouts = relatedWorkouts.data;
        }),
        catchError((error) => {
          console.error('Error fetching related workouts:', error);
          return of([]); // Handle the error, perhaps returning an empty array
        }),
      )
      .subscribe();
  }
}
