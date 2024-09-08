/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { Observable, of } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';
import { CoursesService } from '../../services/courses.service';
import { TimeUtils } from '../../services/time.utils';
import { CourseTileComponent } from './course-tile/course-tile.component';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [
    CommonModule,
    CourseTileComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatIconModule,
  ],
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.scss',
})
export class CoursesComponent implements OnInit {
  startedCourses$!: Observable<any[]>;
  recommendedCourses$!: Observable<any>;
  allCourses$!: Observable<any>;
  isLoadingRecommended = false;
  isLoadingAll = false;
  allTags$!: Observable<string[]>; // Observable for the dropdown
  selectedTags: string[] = [];

  constructor(
    private coursesService: CoursesService,
    private timeUtils: TimeUtils,
  ) {}

  ngOnInit(): void {
    this.startedCourses$ = this.coursesService.getStartedCourses();
    this.allTags$ = this.coursesService.getAllCourseTags();

    this.isLoadingAll = true;

    this.allTags$.subscribe((tags) => {
      // Get the top 5 tags by count (assuming tags are sorted by count)
      this.selectedTags = tags.slice(0, 6);
      this.fetchCoursesBasedOnSelectedTags();
    });

    // Set loading state to true before starting to fetch recommended courses
    this.isLoadingRecommended = true;

    this.recommendedCourses$ = this.startedCourses$.pipe(
      switchMap((startedCourses) => {
        // Extract IDs and tags from started courses
        const startedCourseIds = startedCourses.map(
          (course) => course.course.id,
        );
        const tags = startedCourses.reduce((acc: string[], course: any) => {
          return acc.concat(course.course.tags || []);
        }, []);
        return this.coursesService
          .recommendCourses([...new Set(tags.slice(0, 30))], 5)
          .pipe(
            map((recommendedCourses) =>
              // Filter out the courses that have already been started
              recommendedCourses.data.filter(
                (course: any) => !startedCourseIds.includes(course.id),
              ),
            ),
            catchError((error) => {
              console.error('Error fetching recommended courses:', error);
              return of([]); // Return an empty array in case of error
            }),
            finalize(() => {
              this.isLoadingRecommended = false; // Ensure the loading state is reset
            }),
          );
      }),
    );
  }

  fetchCoursesBasedOnSelectedTags(): void {
    if (this.selectedTags.length > 0) {
      this.allCourses$ = this.coursesService
        .recommendCourses(this.selectedTags, 20)
        .pipe(
          map((courses) => courses.data.sort(this.timeUtils.sortByCreatedDate)), // Sort by createdDate
          catchError((error) => {
            console.error('Error fetching courses:', error);
            return of([]); // Return an empty array in case of error
          }),
          finalize(() => {
            this.isLoadingAll = false; // Ensure the loading state is reset
          }),
        );
    } else {
      this.allCourses$ = this.coursesService.getAllCourses();
    }
  }

  onTagSelected(tag: string): void {
    if (!this.selectedTags.includes(tag)) {
      this.selectedTags.push(tag);
      this.fetchCoursesBasedOnSelectedTags();
    }
  }

  removeTag(tag: string): void {
    const index = this.selectedTags.indexOf(tag);
    if (index >= 0) {
      this.selectedTags.splice(index, 1);
      this.fetchCoursesBasedOnSelectedTags();
    }
  }
}
