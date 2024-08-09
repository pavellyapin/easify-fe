/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/use-unknown-in-catch-callback-variable */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { ActivatedRoute } from '@angular/router';
import { CoursesService } from '../../../services/courses.service';

@Component({
  selector: 'app-course-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatChipsModule,
    MatButtonModule,
    MatExpansionModule,
  ],
  templateUrl: './course-details.component.html',
  styleUrl: './course-details.component.scss',
})
export class CourseDetailsComponent implements OnInit {
  course: any;
  currentChapterIndex = -1;
  constructor(
    private route: ActivatedRoute,
    private coursesService: CoursesService,
  ) {}

  ngOnInit(): void {
    const courseId = this.route.snapshot.paramMap.get('id')!;
    this.coursesService
      .getCourseById(courseId)
      .then((course) => {
        this.course = course;
      })
      .catch((error) => {
        console.error('Error fetching course:', error);
      });
  }
  showNextChapter(): void {
    if (this.currentChapterIndex < this.course.chapters.length - 1) {
      this.currentChapterIndex++;
    }
  }
}
