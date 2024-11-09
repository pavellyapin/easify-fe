/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { CoursesService } from '@services/courses.service';
import { selectStartedCourse } from '@store/started-course/started-course.selectors';
import {
  catchError,
  finalize,
  map,
  Observable,
  of,
  Subscription,
  take,
} from 'rxjs';
import { CoursesCarouselComponent } from '../courses-carousel/courses-carousel.component';
import { LoadingCarouselComponent } from '../courses-carousel/loading-carousel/loading-carousel.component';
import { CourseIntroComponent } from './course-intro/course-intro.component';
import { CourseStatsComponent } from './course-stats/course-stats.component';
import { TableOfContentsComponent } from './table-of-contents/table-of-contents.component';

@Component({
  selector: 'app-course-overview',
  standalone: true,
  imports: [
    TableOfContentsComponent,
    LoadingCarouselComponent,
    CommonModule,
    CoursesCarouselComponent,
    MatIconModule,
    MatButtonModule,
    CourseStatsComponent,
    CourseIntroComponent,
  ],
  templateUrl: './course-overview.component.html',
  styleUrl: './course-overview.component.scss',
})
export class CourseOverviewComponent implements OnInit {
  private subscriptions: Subscription[] = []; // Array to store subscriptions

  course: any;
  recommendedCourses: any[] = [];
  isLoadingRecommendedCourses = true;
  startedCourse$: Observable<any | null> | undefined; // Observable to get the started course
  isMobile = false;
  isTablet = false;

  constructor(
    private route: ActivatedRoute,
    private coursesService: CoursesService,
    private store: Store,
    private router: Router,
    private breakpointObserver: BreakpointObserver,
  ) {}

  ngOnInit(): void {
    // Initialize startedCourse$ observable from the store
    this.startedCourse$ = this.store.select(selectStartedCourse);
    this.course = this.route.snapshot.data['course'];
    this.subscriptions.push(
      this.breakpointObserver
        .observe([Breakpoints.XSmall, Breakpoints.Small])
        .subscribe((result) => {
          const breakpoints = result.breakpoints;
          this.isMobile = breakpoints[Breakpoints.XSmall] ? true : false;
          this.isTablet = breakpoints[Breakpoints.Small] ? true : false;
        }),
    );
    this.loadRecommendedCourses();
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }

  loadRecommendedCourses(): void {
    this.subscriptions.push(
      this.coursesService
        .recommendCourses(this.course.tags, 3)
        .pipe(
          take(1),
          map((response) => {
            this.recommendedCourses = response.data || [];
            this.isLoadingRecommendedCourses = false;
          }),
          catchError((error) => {
            console.error('Error fetching recommended courses:', error);
            this.isLoadingRecommendedCourses = false;
            return of([]);
          }),
          finalize(() => {
            this.isLoadingRecommendedCourses = false;
          }),
        )
        .subscribe(),
    );
  }

  navigateToBreadcrumb(destination: string): void {
    switch (destination) {
      case 'home':
        this.router.navigate(['dashboard']);
        break;
      case 'learningHub':
        this.router.navigate(['dashboard/courses']);
        break;
      default:
        console.warn('Unrecognized breadcrumb destination:', destination);
    }
  }
}
