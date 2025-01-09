/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { CoursesProgressService } from '@services/courses-progress.service';
import { CoursesService } from '@services/courses.service';

@Component({
  selector: 'app-course-tracker',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
  ],
  templateUrl: './course-tracker.component.html',
  styleUrl: './course-tracker.component.scss',
})
export class CourseTrackerComponent {
  @Input() challenge: any;

  constructor(
    private coursesService: CoursesService,
    private coursesProgressService: CoursesProgressService,
    private router: Router,
  ) {}

  // Function to handle the arrow button click
  async onArrowClick(): Promise<void> {
    console.log('Arrow clicked!');

    const { completedSteps = [] } = this.challenge;
    const priorityOrder = [
      'totalStartedCourses',
      'totalCompletedCourses',
      'beginner',
      'intermediate',
      'advanced',
      'categories',
    ];

    // Find the first incomplete step based on priority
    const nextStepKey = priorityOrder.find(
      (key) => !completedSteps.includes(key),
    );

    if (!nextStepKey) {
      console.log('All steps completed.');
      return;
    }

    // Check the step key and execute custom logic for each case
    switch (nextStepKey) {
      case 'totalStartedCourses':
        // Call the recommendCourses function with no tags and a count of 1
        this.coursesService
          .recommendCourses([], 1)
          .subscribe((recommendedCourses) => {
            if (recommendedCourses && recommendedCourses.data.length > 0) {
              const courseId = recommendedCourses.data[0].id;
              console.log('Navigating to recommended course:', courseId);
              this.router.navigate([`dashboard/course/${courseId}`]);
            }
          });
        break;

      case 'totalCompletedCourses':
        // Fetch the latest started course and navigate to its details
        const latestCourse =
          await this.coursesProgressService.getLatestStartedCourse();
        if (latestCourse?.['course']) {
          const courseId = latestCourse['course'].id;
          console.log('Navigating to latest started course:', courseId);
          this.router.navigate([`dashboard/course/${courseId}`]);
        }
        break;

      // Handle other cases for level and category as needed
      case 'beginner':
      case 'intermediate':
      case 'advanced':
      case 'categories':
        console.log(`Handle ${nextStepKey} action...`);
        break;

      default:
        console.log('No matching action found for step:', nextStepKey);
        break;
    }
  }
}
