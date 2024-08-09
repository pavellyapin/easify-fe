/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CoursesService } from '../../services/courses.service';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatChipsModule, MatButtonModule],
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.scss',
})
export class CoursesComponent implements OnInit {
  courses$!: Observable<any[]>;

  constructor(
    private coursesService: CoursesService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.courses$ = this.coursesService.getAllCourses();
  }

  startCourse(courseId: string): void {
    this.router.navigate(['dashboard/course', courseId]);
  }
}
