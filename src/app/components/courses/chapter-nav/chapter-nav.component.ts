/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LoadingNavComponent } from './loading-nav/loading-nav.component';

@Component({
  selector: 'app-chapter-nav',
  standalone: true,
  imports: [CommonModule, MatIconModule, LoadingNavComponent],
  templateUrl: './chapter-nav.component.html',
  styleUrl: './chapter-nav.component.scss',
})
export class ChapterNavComponent implements OnInit, OnDestroy {
  @Input() course: any;
  @Input() loading: any = false;
  @Input() startedCourse: any;
  currentChapterIndex: number | null = null;
  currentTopicIndex: number | null = null;
  private subscriptions: Subscription[] = []; // Array to store subscriptions

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // Subscribe to route parameters and add to subscriptions
    const routeSub = this.route.paramMap.subscribe((params) => {
      const chapter = parseInt(params.get('chapter')!, 10) - 1; // Convert to 0-based index
      const topic = parseInt(params.get('topic')!, 10) - 1; // Convert to 0-based index
      this.currentChapterIndex = chapter;
      this.currentTopicIndex = topic;
    });
    this.subscriptions.push(routeSub);
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }

  // Helper function to determine icon for chapters based on startedCourse progress
  getChapterIcon(index: number) {
    const progressChapter = this.startedCourse?.progress?.chapter ?? 0;
    if (
      index < progressChapter ||
      (index === progressChapter &&
        this.isAllTopicsCompletedInChapter(index, this.startedCourse))
    ) {
      return 'check-round'; // Completed
    } else if (index === progressChapter) {
      return 'progress'; // In-progress
    } else {
      return 'more-horiz'; // Not started
    }
  }

  // Check if all topics in a chapter are completed based on the current progress
  private isAllTopicsCompletedInChapter(
    chapterIndex: number,
    startedCourse: any,
  ): boolean {
    const topicsCount = this.course.chapters[chapterIndex - 1].topics.length;
    return (
      chapterIndex < startedCourse.progress.chapter ||
      (chapterIndex === startedCourse.progress.chapter &&
        startedCourse.progress.topic >= topicsCount)
    );
  }

  // Helper function to determine icon for topics based on startedCourse progress
  getTopicIcon(chapterIndex: number, topicIndex: number) {
    const progressChapter = this.startedCourse?.progress?.chapter ?? 0;
    const progressTopic = this.startedCourse?.progress?.topic ?? 0;
    if (
      chapterIndex < progressChapter ||
      (chapterIndex === progressChapter && topicIndex < progressTopic)
    ) {
      return 'check'; // Completed
    } else if (
      chapterIndex === progressChapter &&
      topicIndex === progressTopic
    ) {
      return 'progress'; // In-progress
    } else {
      return 'more-horiz'; // Not started
    }
  }
  navigateToChapter(chapterIndex: number): void {
    this.router.navigate([
      `/dashboard/course/${this.startedCourse.course.id}/chapter/${chapterIndex}`,
    ]);
  }

  navigateToTopic(chapterIndex: number, topicIndex: number): void {
    this.router.navigate([
      `/dashboard/course/${this.startedCourse.course.id}/chapter/${chapterIndex}/${topicIndex}`,
    ]);
  }

  toggleChapter(index: number): void {
    this.currentChapterIndex =
      this.currentChapterIndex === index ? null : index;
  }
}
