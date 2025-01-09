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
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { TimeUtilsAndMore } from '@services/time.utils';
import { selectStartedCourse } from '@store/started-course/started-course.selectors';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { combineLatest, filter, map, Subscription } from 'rxjs';
import { ChapterNavComponent } from '../chapter-nav/chapter-nav.component';

@Component({
  selector: 'app-course-topic',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    ChapterNavComponent,
    SlickCarouselModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './course-topic.component.html',
  styleUrl: './course-topic.component.scss',
})
export class CourseTopicComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = []; // Array to store subscriptions

  course: any;
  courseId: any;
  startedCourse: any;
  chapter: any;
  topic: any;
  chapterIndex!: number;
  topicIndex!: number;
  isMobile = false;
  isTablet = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    private store: Store,
    public utils: TimeUtilsAndMore,
  ) {}

  ngOnInit(): void {
    // Subscribe to the startedCourse observable and push to subscriptions
    this.subscriptions.push(
      this.store.select(selectStartedCourse).subscribe((startedCourse) => {
        this.startedCourse = startedCourse;
      }),
    );

    this.subscriptions.push(
      combineLatest([this.route.paramMap])
        .pipe(
          filter(([params]) => !!params.get('id')),
          map(([params]) => {
            // Extract route parameters
            this.courseId = params.get('id')!;
            this.chapterIndex = parseInt(params.get('chapter')!, 10);
            this.topicIndex = parseInt(params.get('topic')!, 10);

            // Fetch course and progress data
            this.course = this.route.snapshot.data['course'];
            this.chapter = this.course.chapters[this.chapterIndex - 1];
            this.topic = this.chapter.topics[this.topicIndex - 1];
          }),
        )
        .subscribe(),
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
      case 'learningHub':
        this.router.navigate(['dashboard/courses']);
        break;
      case 'course':
        this.router.navigate([`dashboard/course/${this.courseId}`]);
        break;
      case 'chapter':
        this.router.navigate([
          `/dashboard/course/${this.courseId}/chapter/${this.chapterIndex}`,
        ]);
        break;
      default:
        console.warn('Unrecognized breadcrumb destination:', destination);
    }
  }
}
