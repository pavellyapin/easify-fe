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
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { CoursesProgressService } from '@services/courses-progress.service';
import * as StartedCourseActions from '@store/started-course/started-course.actions';
import { selectStartedCourse } from '@store/started-course/started-course.selectors';
import {
  SlickCarouselComponent,
  SlickCarouselModule,
} from 'ngx-slick-carousel';
import { Subscription } from 'rxjs';
import { ChapterNavComponent } from '../chapter-nav/chapter-nav.component';
import { TopicLoaderComponent } from './topic-loader/topic-loader.component';

@Component({
  selector: 'app-course-topic',
  standalone: true,
  imports: [
    CommonModule,
    ChapterNavComponent,
    SlickCarouselModule,
    MatIconModule,
    MatButtonModule,
    TopicLoaderComponent,
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
  currentIndex = 0;
  topicComplete = false;
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
  chapterIndex!: number;
  topicIndex!: number;
  isMobile = false;
  isTablet = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseProgressService: CoursesProgressService,
    private breakpointObserver: BreakpointObserver,
    private store: Store,
  ) {}

  ngOnInit(): void {
    // Subscribe to the startedCourse observable and push to subscriptions
    this.subscriptions.push(
      this.store.select(selectStartedCourse).subscribe((startedCourse) => {
        this.startedCourse = startedCourse;
      }),
    );

    this.initializeComponent();

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

  private initializeComponent(): void {
    this.subscriptions.push(
      this.route.paramMap.subscribe((params: ParamMap) => {
        this.initLoading = true;
        this.currentIndex = 0;
        if (this.slickModal) {
          this.slickModal.slickGoTo(0);
        }
        this.chapterIndex = parseInt(params.get('chapter')!, 10);
        this.topicIndex = parseInt(params.get('topic')!, 10);
        this.courseId = params.get('id')!;
        this.course = this.route.snapshot.data['course'];
        this.chapter = this.course.chapters[this.chapterIndex - 1];
        this.topic = this.chapter.topics[this.topicIndex - 1];
        this.checkAccess(this.chapterIndex, this.topicIndex);
      }),
    );
  }

  private checkAccess(chapterIndex: number, topicIndex: number): void {
    const { chapter, topic } = this.startedCourse.progress;

    // Check if the requested topic is beyond the user's progress
    if (
      chapterIndex > chapter ||
      (chapterIndex === chapter && topicIndex > topic)
    ) {
      // Redirect to the last topic in progress
      this.router.navigate([
        `/dashboard/course/${this.courseId}/chapter/${chapter}/${topic}`,
      ]);
    } else {
      // User has access, proceed with the topic evaluation
      this.evaluateProgress(chapterIndex, topicIndex);
    }
  }

  private evaluateProgress(chapterIndex: number, topicIndex: number): void {
    const { chapter, topic } = this.startedCourse.progress;

    // Set topicComplete based on progress data
    this.topicComplete =
      chapter > chapterIndex ||
      (chapter === chapterIndex &&
        topic >= topicIndex &&
        this.startedCourse.progress.topicComplete > 0);
    // Add a small delay before setting loading to false
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
    if (this.currentIndex < this.topic.points.length - 1) {
      this.currentIndex++;
      this.slickModal.slickNext();
      this.updateTopicProgress();
    } else {
      this.navigateNext();
    }
  }

  updateTopicProgress(): void {
    if (
      this.currentIndex === this.topic.points.length - 1 &&
      !this.topicComplete
    ) {
      this.updateCourseProgress();
    }
  }

  async updateCourseProgress(): Promise<void> {
    this.loading = true;
    let nextChapterIndex = this.chapterIndex;
    let nextTopicIndex = this.topicIndex + 1;

    // Check if we are at the last topic of the last chapter
    if (
      nextChapterIndex > this.course.chapters.length ||
      (nextChapterIndex === this.course.chapters.length &&
        nextTopicIndex >
          this.course.chapters[nextChapterIndex - 1].topics.length)
    ) {
      nextTopicIndex = this.topicIndex;
    } else if (nextTopicIndex > this.chapter.topics.length) {
      // Move to the first topic of the next chapter
      nextChapterIndex++;
      nextTopicIndex = 1; // Reset topic index to the first topic of the next chapter
    }

    const progress =
      ((this.startedCourse.progress.completeTopics + 1) /
        this.startedCourse.progress.totalTopics) *
      100;

    try {
      await this.courseProgressService.updateCourseProgress(this.courseId, {
        chapter: nextChapterIndex,
        topic: nextTopicIndex,
        progress,
        totalTopics: this.startedCourse.progress.totalTopics,
        completeTopics: this.startedCourse.progress.completeTopics + 1,
      });
      console.log('Course progress updated successfully');
      // Refetch the updated startedCourse data
      const startedCourse =
        await this.courseProgressService.getStartedCourseById(this.courseId);
      this.store.dispatch(
        StartedCourseActions.loadStartedCourseSuccess({ startedCourse }),
      );
      this.topicComplete = true;
      this.loading = false;
    } catch (error) {
      console.error('Error updating course progress:', error);
    }
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

  navigateNext(): void {
    if (this.topicIndex < this.chapter.topics.length) {
      // Navigate to the next topic in the current chapter
      this.router.navigate([
        `dashboard/course/${this.courseId}/chapter/${this.chapterIndex}/${this.topicIndex + 1}`,
      ]);
    } else if (this.chapterIndex < this.course.chapters.length) {
      // Navigate to the first topic of the next chapter
      this.router.navigate([
        `dashboard/course/${this.courseId}/chapter/${this.chapterIndex + 1}`,
      ]);
    } else {
      // Navigate to the course overview as this is the last topic of the last chapter
      this.router.navigate([`dashboard/course/${this.courseId}/overview`]);
    }
  }
  navigatePrevious(): void {
    if (this.topicIndex > 1) {
      // Navigate to the previous topic within the same chapter
      this.router.navigate([
        `dashboard/course/${this.courseId}/chapter/${this.chapterIndex}/${this.topicIndex - 1}`,
      ]);
    } else if (this.chapterIndex > 1) {
      // If the first topic of the current chapter, navigate to the last topic of the previous chapter
      const previousChapterIndex = this.chapterIndex - 1;
      const previousChapter = this.course.chapters[previousChapterIndex - 1];
      const lastTopicIndex = previousChapter.topics.length;
      this.router.navigate([
        `dashboard/course/${this.courseId}/chapter/${previousChapterIndex}/${lastTopicIndex}`,
      ]);
    } else {
      // If the first topic of the first chapter, navigate to the course overview
      this.router.navigate([`dashboard/course/${this.courseId}/overview`]);
    }
  }
}
