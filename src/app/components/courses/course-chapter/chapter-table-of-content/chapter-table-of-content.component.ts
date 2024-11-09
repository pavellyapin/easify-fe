/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-chapter-table-of-content',
  standalone: true,
  imports: [CommonModule, MatExpansionModule, MatIconModule, MatButtonModule],
  templateUrl: './chapter-table-of-content.component.html',
  styleUrl: './chapter-table-of-content.component.scss',
})
export class ChapterTableOfContentComponent implements OnInit {
  @Input() chapter: any;
  @Input() startedCourse: any;
  @Input() loading: any;
  currentChapterIndex: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // Subscribe to route parameters to get the current chapter and topic
    this.route.paramMap.subscribe((params) => {
      const chapter = parseInt(params.get('chapter')!, 10) - 1; // Convert to 0-based index
      this.currentChapterIndex = chapter;
    });
  }
  // Helper function to determine icon for topics based on startedCourse progress
  getTopicIcon(chapterIndex: number, topicIndex: number): string {
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

  navigateToTopic(chapterIndex: number, topicIndex: number): void {
    this.router.navigate([
      `/dashboard/course/${this.startedCourse.course.id}/chapter/${chapterIndex}/${topicIndex}`,
    ]);
  }
}
