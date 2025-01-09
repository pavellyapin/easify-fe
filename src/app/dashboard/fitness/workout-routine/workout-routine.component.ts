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
import { selectStartedWorkout } from '@store/started-workout/started-workout.selectors';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { Subscription } from 'rxjs';
import { WorkoutNavComponent } from '../workout-nav/workout-nav.component';

@Component({
  selector: 'app-workout-routine',
  standalone: true,
  imports: [
    CommonModule,
    WorkoutNavComponent,
    SlickCarouselModule,
    MatIconModule,
    MatButtonModule,
    RouterOutlet,
  ],
  templateUrl: './workout-routine.component.html',
  styleUrl: './workout-routine.component.scss',
})
export class WorkoutRoutineComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = []; // Array to store subscriptions

  routine: any;
  routineId: any;
  startedWorkout: any;
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
      // Second subscription: Handle updates to startedWorkout
      this.store.select(selectStartedWorkout).subscribe((startedWorkout) => {
        this.startedWorkout = startedWorkout;
      }),
    );

    this.subscriptions.push(
      this.route.paramMap.subscribe((params: ParamMap) => {
        this.routineId = params.get('id')!;
        this.routine = this.route.snapshot.data['workout'];
      }),
    );

    this.subscriptions.push(
      this.breakpointObserver
        .observe([Breakpoints.XSmall, Breakpoints.Small])
        .subscribe((result) => {
          const breakpoints = result.breakpoints;
          this.isMobile = breakpoints[Breakpoints.XSmall] ? true : false;
          this.isTablet = breakpoints[Breakpoints.Small] ? true : false;
        }),
    );
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
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
        this.router.navigate([`dashboard/workout/${this.routineId}/overview`]);
        break;
      default:
        console.warn('Unrecognized breadcrumb destination:', destination);
    }
  }
}
