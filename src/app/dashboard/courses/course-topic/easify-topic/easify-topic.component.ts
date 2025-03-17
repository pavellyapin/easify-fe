/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { EasifyResponseContentComponent } from '@components/easify-response-content/easify-response-content.component';
import { Store } from '@ngrx/store';
import { TimeUtilsAndMore } from '@services/time.utils';
import { selectEasifyCourseResponses } from '@store/started-course/started-course.selectors';
import { combineLatest, filter, map, Subscription } from 'rxjs';

@Component({
  selector: 'app-easify-topic',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, EasifyResponseContentComponent],
  templateUrl: './easify-topic.component.html',
  styleUrl: './easify-topic.component.scss',
})
export class EasifyTopicComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = []; // Array to store subscriptions
  easifyResponse: any;
  courseId!: string;
  chapterIndex!: number;
  topicIndex!: number;
  pointIndex!: number;
  context: any;

  constructor(
    private route: ActivatedRoute,
    private store: Store,
    public utils: TimeUtilsAndMore,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      combineLatest([
        this.store.select(selectEasifyCourseResponses),
        this.route.paramMap,
        this.route.parent?.paramMap || [],
        this.route.parent?.data || [], // Subscribe to parent route's data
      ])
        .pipe(
          filter(([responses, , , parentData]) => !!responses && !!parentData),
          map(([responses, params, parentParams, parentData]) => {
            this.courseId = parentParams.get('id')!;
            this.chapterIndex = parseInt(
              params.get('chapter') || parentParams.get('chapter') || '1',
              10,
            );
            this.topicIndex = parseInt(
              params.get('topic') || parentParams.get('topic') || '1',
              10,
            );
            this.pointIndex = parseInt(params.get('point') || '1', 10);

            // Assign responses for the current point to easifyResponse
            this.easifyResponse = responses
              .filter(
                (response: any) =>
                  response.itemId === this.courseId &&
                  response.request.item.chapterNumber ===
                    this.chapterIndex - 1 &&
                  response.request.item.topicNumber === this.topicIndex - 1 &&
                  response.request.item.pointIndex === this.pointIndex - 1,
              )
              .pop();

            // Use the course data from the parent route
            const course = parentData['course'];
            if (course) {
              const chapterTitle =
                course.chapters?.[this.chapterIndex - 1]?.title ||
                'Unknown Chapter';
              const topicTitle =
                course.chapters?.[this.chapterIndex - 1]?.topics?.[
                  this.topicIndex - 1
                ]?.title || 'Unknown Topic';

              this.context = `I am going through the course "${course.name}" in chapter "${chapterTitle}" and topic "${topicTitle}".`;
            } else {
              this.context = 'Course information is not available.';
            }
          }),
        )
        .subscribe(),
    );
  }

  /**
   * Navigates back to the topic route with the pointIndex as route data.
   */
  goBack(): void {
    this.router.navigate([
      `/dashboard/course/${this.courseId}/chapter/${this.chapterIndex}/${this.topicIndex}/${this.pointIndex}`,
    ]);
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }
}
