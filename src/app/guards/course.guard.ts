/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  UrlTree,
} from '@angular/router';
import { CourseItem } from '@components/models/course.models';
import { Store } from '@ngrx/store';
import { CoursesProgressService } from '@services/courses-progress.service';
import { CoursesService } from '@services/courses.service';
import { setDashboardLoading } from '@store/loader/loading.actions';
import * as StartedCourseActions from '@store/started-course/started-course.actions';

@Injectable({
  providedIn: 'root',
})
export class CourseGuard implements CanActivate {
  constructor(
    private coursesService: CoursesService,
    private coursesProgressService: CoursesProgressService,
    private router: Router,
    private store: Store,
  ) {}

  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean | UrlTree> {
    this.store.dispatch(setDashboardLoading(true));
    const courseId = route.paramMap.get('id')!;
    try {
      // Fetch the course by ID
      const course = await this.coursesService.getCourseById(courseId);

      if (!course) {
        // If the course does not exist, redirect to a 404 page or home
        console.error(`Course with ID ${courseId} not found.`);
        return this.router.parseUrl('error');
      }
      route.data = { course };
      // Check if the user has already started the course
      const startedCourse =
        await this.coursesProgressService.getStartedCourseById(courseId);

      if (!startedCourse) {
        // If no started course is found, create a new one
        const newCourseItem: CourseItem = {
          id: courseId,
          name: course.name,
          overview: course.overview,
          level: course.level,
          category: course.category,
          image: course.image,
          tags: course.tags,
          isNew: course.isNew ? course.isNew : false,
        };

        const totalTopicsCount = course?.chapters
          ? course.chapters.reduce((acc: number, chapter: any) => {
              return acc + (chapter.topics ? chapter.topics.length : 0);
            }, 0)
          : 0;

        const progress = {
          chapter: 1,
          topic: 1,
          progress: 0,
          completeTopics: 0,
          totalTopics: totalTopicsCount,
        };

        await this.coursesProgressService.addCourseStart(
          newCourseItem,
          progress,
        );
        const startedCourse =
          await this.coursesProgressService.getStartedCourseById(courseId);
        // Store the new started course in the route's data property
        route.data = { course };
        // Dispatch action to store the started course data in the store
        this.store.dispatch(
          StartedCourseActions.loadStartedCourseSuccess({ startedCourse }),
        );
        this.store.dispatch(setDashboardLoading(false));
        return true;
      }

      // Dispatch action to store the started course data in the store
      this.store.dispatch(
        StartedCourseActions.loadStartedCourseSuccess({ startedCourse }),
      );

      // Fetch Easify responses for the course
      const easifyResponses =
        await this.coursesProgressService.getEasifyResponsesByItemId(courseId);

      // Dispatch action to store Easify responses in the state
      this.store.dispatch(
        StartedCourseActions.loadCourseEasifyResponsesSuccess({
          responses: easifyResponses,
        }),
      );

      this.store.dispatch(setDashboardLoading(false));

      // Allow navigation
      return true;
    } catch (error) {
      console.error('Error in course guard:', error);
      return this.router.parseUrl('/error'); // Redirect to an error page if something goes wrong
    }
  }
}
