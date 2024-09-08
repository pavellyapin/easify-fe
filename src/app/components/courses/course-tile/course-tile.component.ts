/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { Router } from '@angular/router';
import { CoursesService } from '../../../services/courses.service';

@Component({
  selector: 'app-course-tile',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatChipsModule, MatButtonModule],
  templateUrl: './course-tile.component.html',
  styleUrl: './course-tile.component.scss',
})
export class CourseTileComponent {
  @Input() course!: any;
  constructor(
    private router: Router,
    private coursesService: CoursesService,
  ) {}
  async startCourse(courseId: string): Promise<void> {
    try {
      // Add the course start information to Firestore using the service
      await this.coursesService.addCourseStart(this.course);

      // Navigate to the course dashboard
      this.router.navigate(['dashboard/course', courseId]);
    } catch (error: any) {
      console.error('Failed to start course:', error);
    }
  }
}
