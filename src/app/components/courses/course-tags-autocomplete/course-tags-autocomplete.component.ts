/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @angular-eslint/prefer-output-readonly */
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { CoursesService } from '@services/courses.service';
import { map, Observable, startWith } from 'rxjs';

@Component({
  selector: 'app-course-tags-autocomplete',
  standalone: true,
  imports: [
    CommonModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
  ],
  templateUrl: './course-tags-autocomplete.component.html',
  styleUrl: './course-tags-autocomplete.component.scss',
})
export class CourseTagsAutocompleteComponent implements OnInit {
  filteredCourses!: Observable<string[]>;
  courseCtrl = new FormControl('');
  allCourses: string[] = [];
  @Output() courseAdded = new EventEmitter<string>();

  constructor(private coursesService: CoursesService) {
    this.filteredCourses = this.courseCtrl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value ?? '')),
    );
  }

  ngOnInit(): void {
    // Fetch all available courses on initialization
    this.coursesService.getAllCourseTags().subscribe((courses) => {
      this.allCourses = courses;
      this.filteredCourses = this.courseCtrl.valueChanges.pipe(
        startWith(''),
        map((value) => this._filterCourses(value ?? '')),
      );
    });
  }

  addCourseFromInput(): void {
    const value = this.courseCtrl.value?.trim();
    if (value) {
      this.courseAdded.emit(value);
      console.log('Course added from input:', value);
      this.courseCtrl.setValue(''); // Clear the input field after adding
    }
  }

  addCourse(event: any): void {
    const course = event.option.value;
    if (course) {
      this.courseAdded.emit(course);
      console.log('Course added from input:', course);
      this.courseCtrl.setValue(''); // Clear the input field after adding
    }
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allCourses.filter((course) =>
      course.toLowerCase().includes(filterValue),
    );
  }

  private _filterCourses(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allCourses.filter((course) =>
      course.toLowerCase().includes(filterValue),
    );
  }
}
