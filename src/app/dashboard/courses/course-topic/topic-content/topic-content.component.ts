import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { TopicLoaderComponent } from '@components/topic-loader/topic-loader.component';
import { Store } from '@ngrx/store';
import { CoursesProgressService } from '@services/courses-progress.service';
import { EasifyService } from '@services/easify.service';
import * as StartedCourseActions from '@store/started-course/started-course.actions';
import {
  selectEasifyCourseResponses,
  selectStartedCourse,
} from '@store/started-course/started-course.selectors';
import {
  SlickCarouselComponent,
  SlickCarouselModule,
} from 'ngx-slick-carousel';
import { combineLatest, map, Subscription } from 'rxjs';

@Component({
  selector: 'app-topic-content',
  standalone: true,
  imports: [
    CommonModule,
    SlickCarouselModule,
    MatIconModule,
    MatButtonModule,
    TopicLoaderComponent,
    MatBadgeModule,
  ],
  templateUrl: './topic-content.component.html',
  styleUrl: './topic-content.component.scss',
})
export class TopicContentComponent implements OnDestroy, OnInit {
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
    private store: Store,
    private easifyService: EasifyService,
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.store.select(selectStartedCourse).subscribe((startedCourse) => {
        this.startedCourse = startedCourse;
      }),
    );
    this.subscriptions.push(
      combineLatest([
        this.store.select(selectEasifyCourseResponses),
        this.route.paramMap,
        this.route.parent?.paramMap || [],
      ])
        .pipe(
          map(([responses, params, parentParams]) => {
            // Begin loading
            this.initLoading = true;

            this.courseId = parentParams?.get('id');
            this.chapterIndex = parseInt(
              params.get('chapter') || parentParams?.get('chapter') || '1',
              10,
            );
            this.topicIndex = parseInt(
              params.get('topic') || parentParams?.get('topic') || '1',
              10,
            );
            const pointIndex = parseInt(params.get('point') || '1', 10);

            // Fetch course and progress data
            // Fetch course and progress data from parent route
            const parentData = this.route.parent?.snapshot.data;
            if (parentData) {
              this.course = parentData['course'];
            }

            if (!this.course) {
              console.error('Course data is not available!');
              return;
            }
            this.chapter = this.course.chapters[this.chapterIndex - 1];
            this.topic = this.chapter.topics[this.topicIndex - 1];

            // Update `hasResponse` flag for points with Easify responses
            this.topic.points = this.topic.points.map(
              (point: any, index: number) => ({
                ...point,
                hasResponse: responses.some(
                  (response: any) =>
                    response.itemId === this.courseId &&
                    response.request.item.chapterNumber ===
                      this.chapterIndex - 1 &&
                    response.request.item.topicNumber === this.topicIndex - 1 &&
                    response.request.item.pointIndex === index,
                ),
              }),
            );
            // Check access and evaluate progress
            this.checkAccess(this.chapterIndex, this.topicIndex);

            this.currentIndex = pointIndex - 1;
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
  expandPoint(pointIndex: number): void {
    const point = this.topic.points[pointIndex];

    // Check if the point has a response
    if (point.hasResponse) {
      // Set initLoading to true
      this.initLoading = true;

      // Add a 3-second delay before navigating
      setTimeout(() => {
        this.initLoading = false; // Stop loading state
        this.router.navigate([
          `/dashboard/course/${this.courseId}/chapter/${this.chapterIndex}/${this.topicIndex}/${pointIndex + 1}/easify/`,
        ]);
      }, 3000);
    } else {
      // Proceed with Easify service call if no response exists
      this.initLoading = true;
      const request = {
        type: 'course',
        item: {
          id: this.courseId,
          chapterNumber: this.chapterIndex - 1,
          topicNumber: this.topicIndex - 1,
          pointIndex,
        },
      };

      this.easifyService.expandContent(request).subscribe({
        next: async (response) => {
          console.log('Expanded content:', response);
          // Fetch Easify responses for the course
          const easifyResponses =
            await this.courseProgressService.getEasifyResponsesByItemId(
              this.courseId,
            );

          // Dispatch action to store Easify responses in the state
          this.store.dispatch(
            StartedCourseActions.loadCourseEasifyResponsesSuccess({
              responses: easifyResponses,
            }),
          );
          this.router.navigate([
            `/dashboard/course/${this.courseId}/chapter/${this.chapterIndex}/${this.topicIndex}/${pointIndex + 1}/easify/`,
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
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }
}
