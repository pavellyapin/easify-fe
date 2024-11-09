/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
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
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectStartedCourse } from '@store/started-course/started-course.selectors';
import { Observable, Subscription } from 'rxjs';
import { ChapterNavComponent } from '../chapter-nav/chapter-nav.component';
import { ChapterTableOfContentComponent } from './chapter-table-of-content/chapter-table-of-content.component';

@Component({
  selector: 'app-course-chapter',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    ChapterTableOfContentComponent,
    ChapterNavComponent,
  ],
  templateUrl: './course-chapter.component.html',
  styleUrl: './course-chapter.component.scss',
})
export class CourseChapterComponent implements OnInit, OnDestroy {
  course: any;
  courseId: any;
  startedCourse$: Observable<any>; // Observable for startedCourse
  chapter: any;
  chapterIndex: any;
  isMobile = false;
  isTablet = false;
  loading = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    private store: Store,
  ) {
    // Initialize startedCourse$ observable from the store
    this.startedCourse$ = this.store.select(selectStartedCourse);
  }

  ngOnInit(): void {
    const paramMapSub = this.route.paramMap.subscribe((params: ParamMap) => {
      this.loading = true;
      this.courseId = params.get('id')!;
      this.chapterIndex = parseInt(params.get('chapter')!, 10);
      this.course = this.route.snapshot.data['course'];
      this.chapter = this.course.chapters[this.chapterIndex - 1];

      setTimeout(() => {
        this.loading = false;
      }, 300);
    });
    this.subscriptions.push(paramMapSub);

    const breakpointSub = this.breakpointObserver
      .observe([Breakpoints.XSmall, Breakpoints.Small])
      .subscribe((result) => {
        const breakpoints = result.breakpoints;
        this.isMobile = breakpoints[Breakpoints.XSmall] ?? false;
        this.isTablet = breakpoints[Breakpoints.Small] ?? false;
      });
    this.subscriptions.push(breakpointSub);
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

  navigateToPreviousChapter(): void {
    if (this.chapterIndex > 1) {
      this.router.navigate([
        `/dashboard/course/${this.courseId}/chapter/${this.chapterIndex - 1}`,
      ]);
    }
  }

  navigateToNextChapter(): void {
    if (this.chapterIndex < this.course.chapters.length) {
      this.router.navigate([
        `/dashboard/course/${this.courseId}/chapter/${this.chapterIndex + 1}`,
      ]);
    }
  }

  navigateToInProgressTopic(): void {
    const sub = this.startedCourse$.subscribe((startedCourse) => {
      const inProgressChapter = startedCourse.progress.chapter;
      const inProgressTopic = startedCourse.progress.topic;

      if (startedCourse.status === 'completed') {
        this.router.navigate([
          `/dashboard/course/${startedCourse.course.id}/chapter/${this.chapterIndex}/1`,
        ]);
      } else {
        this.router.navigate([
          `/dashboard/course/${startedCourse.course.id}/chapter/${inProgressChapter}/${inProgressTopic}`,
        ]);
      }
    });
    this.subscriptions.push(sub);
  }
}
