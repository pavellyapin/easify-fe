/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-table-of-contents',
  standalone: true,
  imports: [CommonModule, MatExpansionModule, MatIconModule, MatButtonModule],
  templateUrl: './table-of-contents.component.html',
  styleUrl: './table-of-contents.component.scss',
})
export class TableOfContentsComponent {
  @Input() course: any;
  @Input() startedCourse: any;

  constructor(private router: Router) {}

  getChapterIcon(chapterIndex: number): string {
    const progressChapter = this.startedCourse?.progress?.chapter ?? 0;

    if (
      chapterIndex < progressChapter ||
      this.startedCourse.status === 'completed'
    ) {
      return 'check-round'; // Completed
    } else if (chapterIndex === progressChapter) {
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
}
