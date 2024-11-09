/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { CapitalizePipe } from '@services/capitalize.pipe';
import { CoursesProgressService } from '@services/courses-progress.service';
import { SuggestedActionComponent } from '../../../suggested-action/suggested-action.component';

@Component({
  selector: 'app-course-stats',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    SuggestedActionComponent,
    CapitalizePipe,
    MatProgressBarModule,
  ],
  templateUrl: './course-stats.component.html',
  styleUrl: './course-stats.component.scss',
})
export class CourseStatsComponent implements OnInit {
  @Input() course: any;
  @Input() startedCourse: any;
  @Input() isMobile = false;
  @Input() isTablet = false;

  chaptersCount = 0;
  quizzesCount = 0;
  totalTopicsCount = 0;
  estimatedTime = 0; // In hours

  constructor(
    private router: Router,
    private courseProgressService: CoursesProgressService,
  ) {}

  ngOnInit(): void {
    if (this.course) {
      this.calculateStats();
    }
  }

  calculateStats(): void {
    this.chaptersCount = this.course?.chapters?.length || 0;

    this.totalTopicsCount = this.course?.chapters
      ? this.course.chapters.reduce((acc: number, chapter: any) => {
          return acc + (chapter.topics ? chapter.topics.length : 0);
        }, 0)
      : 0;

    this.quizzesCount = this.course?.chapters
      ? this.course.chapters.reduce((acc: number, chapter: any) => {
          // Count only topics that contain a quiz
          return (
            acc +
            (chapter.topics
              ? chapter.topics.filter((topic: any) => topic.quiz).length
              : 0)
          );
        }, 0)
      : 0;

    // Assuming each topic takes 5 minutes
    const totalMinutes = this.totalTopicsCount * 5;
    const timeInHours = totalMinutes / 60; // Convert to hours

    // Round the time to the nearest 0.5 or 1 hour
    this.estimatedTime = this.roundToNearestHalf(timeInHours);
  }

  // Function to round to the nearest 0.5
  roundToNearestHalf(value: number): number {
    return Math.round(value * 2) / 2;
  }

  async initializeOrUpdateProgress(): Promise<void> {
    if (!this.startedCourse.progress) {
      await this.courseProgressService.updateCourseProgress(
        this.startedCourse.course.id,
        {
          chapter: 1,
          topic: 1,
          progress: 0,
          completeTopics: 0,
          totalTopics: this.totalTopicsCount,
        },
      );

      this.navigateToChapter(1); // Navigate to the first chapter if starting from the beginning
    } else {
      this.navigateToChapter(
        this.startedCourse.status == 'completed'
          ? 1
          : this.startedCourse.progress.chapter,
      );
    }
  }

  navigateToChapter(chapterNumber: number): void {
    this.router.navigate([
      'dashboard/course',
      this.startedCourse.course.id,
      'chapter',
      chapterNumber,
    ]);
  }

  completeModule() {
    console.log('');
  }
}
