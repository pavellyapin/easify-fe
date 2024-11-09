/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { SuggestedActionComponent } from '@components/suggested-action/suggested-action.component';
import { ChallengeService } from '@services/challenges.service';
import { CoursesProgressService } from '@services/courses-progress.service';
import { CoursesService } from '@services/courses.service';
import { combineLatest, Observable, of, Subscription } from 'rxjs';
import { catchError, finalize, map, take } from 'rxjs/operators';
import { AllCoursesComponent } from './all-courses/all-courses.component';
import { CourseTrackerComponent } from './course-tracker/course-tracker.component';
import { CoursesCarouselComponent } from './courses-carousel/courses-carousel.component';
import { LoadingCarouselComponent } from './courses-carousel/loading-carousel/loading-carousel.component';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    CoursesCarouselComponent,
    LoadingCarouselComponent,
    AllCoursesComponent,
    CourseTrackerComponent,
    SuggestedActionComponent,
  ],
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.scss'],
})
export class CoursesComponent implements OnInit {
  startedCourses$!: Observable<any[]>;
  recommendedCourses$!: Observable<any>;
  combinedCourses: any[] = [];
  isLoadingCombinedCourses = true; // Loading state for combined courses
  firstIncompleteChallenge: any;
  isMobile = false;
  isTablet = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private coursesProgressService: CoursesProgressService,
    private coursesService: CoursesService,
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
    // Fetch and normalize started courses with progress added to each course object
    this.startedCourses$ = this.coursesProgressService.getStartedCourses().pipe(
      take(1), // Only take the first emission and complete
      map((startedCourses: any[]) => {
        return startedCourses.map((startedCourse) => ({
          ...startedCourse.course, // Spread the course properties
          progress: startedCourse.progress, // Add progress field
        }));
      }),
      catchError((error) => {
        console.error('Error fetching started courses:', error);
        return of([]); // Return empty array on error
      }),
    );

    // Fetch recommended courses and directly map the response
    this.recommendedCourses$ = this.coursesService.recommendCourses([], 3).pipe(
      take(1), // Only take the first emission and complete
      map((courses) => courses.data || []),
      catchError((error) => {
        console.error('Error fetching recommended courses:', error);
        return of([]); // Return empty array on error
      }),
    );

    // Combine started and recommended courses
    combineLatest([this.startedCourses$, this.recommendedCourses$])
      .pipe(
        map(([startedCourses, recommendedCourses]) => {
          // Remove duplicates based on course name
          this.isLoadingCombinedCourses = false;
          return [...startedCourses, ...recommendedCourses];
        }),
        finalize(() => {
          this.isLoadingCombinedCourses = false; // Set loading to false once courses are loaded
        }),
      )
      .subscribe((combinedCourses) => {
        this.combinedCourses = combinedCourses;
      });

    // Fetch first incomplete challenge of type "learn"
    this.loadFirstIncompleteChallenge();
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }

  private async loadFirstIncompleteChallenge() {
    try {
      this.firstIncompleteChallenge =
        await this.challengesService.getFirstIncompleteChallengeByType('learn');
    } catch (error) {
      console.error('Error loading first incomplete challenge:', error);
    }
  }

  // Function to complete a module
  completeModule() {
    console.log('Complete Module 1 action triggered');
    // Add your logic here for completing the module
  }
}
