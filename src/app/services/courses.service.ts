/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/use-unknown-in-catch-callback-variable */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  doc,
  DocumentData,
  Firestore,
  getDoc,
} from '@angular/fire/firestore';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { Store } from '@ngrx/store';
import { selectWorkSkills } from '@store/user/user.selector';
import { from, map, Observable, of, switchMap, take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CoursesService {
  constructor(
    private firestore: Firestore,
    private functions: Functions,
    private store: Store,
  ) {}

  getAllCourses(): Observable<any> {
    const coursesCollectionRef = collection(this.firestore, 'courses');
    return collectionData(coursesCollectionRef, {
      idField: 'id',
    }).pipe(
      map((courses: DocumentData[]) =>
        courses.map((course) => ({
          id: course['id'],
          name: course['name'],
          level: course['level'],
          overview: course['overview'],
          tags: course['tags'],
        })),
      ),
    ) as Observable<any>;
  }

  async getCourseById(id: string): Promise<any> {
    const courseDocRef = doc(this.firestore, `courses/${id}`);
    const courseDoc = await getDoc(courseDocRef);
    if (courseDoc.exists()) {
      return courseDoc.data();
    } else {
      throw new Error(`Course with ID ${id} not found`);
    }
  }

  // New method to call the filterCourses function
  filterCourses(
    filters: {
      categories?: string[];
      levels?: string[];
      isNew?: boolean;
      sortBy?: string;
    },
    count: number,
    lastCourse: any = null, // Pass the last course for pagination (batch loading)
  ): Observable<any> {
    const filterCoursesFunction = httpsCallable(
      this.functions,
      'filterCourses',
    );

    const requestPayload = {
      ...filters,
      count,
      lastCourse,
    };

    const resultPromise = filterCoursesFunction(requestPayload);
    return from(resultPromise); // Convert the Promise to an Observable
  }

  recommendCourses(courseTags: string[], count: any): Observable<any> {
    const recommendCoursesFunction = httpsCallable(
      this.functions,
      'recommendCourses',
    );
    const resultPromise = recommendCoursesFunction({ courseTags, count });
    return from(resultPromise); // Convert the Promise to an Observable
  }

  getAllCourseTags(): Observable<string[]> {
    const tagCountsRef = doc(this.firestore, 'tagCounts/courseTags');

    return from(getDoc(tagCountsRef)).pipe(
      map((docSnapshot) => {
        const tagData = docSnapshot.data() || { tags: [] };

        // Extract the tag names from the array of objects
        return tagData['tags'].map(
          (tagObj: { tag: string; count: number }) => tagObj.tag,
        );
      }),
    );
  }
  getCategoryFilters(): Observable<string[]> {
    return this.store.select(selectWorkSkills).pipe(
      take(1),
      switchMap((workSkills) => {
        const workSkillsCategories = workSkills?.courseTags;

        // If categories exist in workSkills, return them as an Observable
        if (workSkillsCategories && workSkillsCategories.length > 0) {
          return of(workSkillsCategories);
        }

        // If no workSkills categories exist, return an Observable from the Promise
        return from(this.getTopCategoriesFromTagCounts());
      }),
    );
  }

  private async getTopCategoriesFromTagCounts(): Promise<string[]> {
    const tagCountsRef = doc(this.firestore, 'tagCounts/courseCategories');
    const tagCountsDoc = await getDoc(tagCountsRef);

    if (tagCountsDoc.exists()) {
      const categoryData = tagCountsDoc.data()['categories'] || [];

      // Sort categories by count in descending order
      const sortedCategories = categoryData
        .sort((a: any, b: any) => b.count - a.count)
        .map((category: any) => category.category);

      // Return a random selection of 3 categories from the top 20
      const topCategories = sortedCategories.slice(0, 20);
      return this.getRandomSelection(topCategories, 3);
    }

    return [];
  }

  // Helper function to select N random elements from an array
  private getRandomSelection(array: string[], count: number): string[] {
    const shuffled = array.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  getAllCourseCategories(): Observable<string[]> {
    const categoryRef = doc(this.firestore, 'tagCounts/courseCategories');

    return from(getDoc(categoryRef)).pipe(
      map((docSnapshot) => {
        const categoryData = docSnapshot.data() || { categories: [] };

        // Extract the cuisine names from the array of objects
        const cuisineNames = categoryData['categories'].map(
          (categoryObj: any) => categoryObj.category,
        );

        // Sort the category names alphabetically
        return cuisineNames.sort((a: string, b: string) => a.localeCompare(b));
      }),
    );
  }

  courseKeywordSearch(keyword: string): Observable<any> {
    const courseKeywordSearchFunction = httpsCallable(
      this.functions,
      'courseKeywordSearch',
    );
    const resultPromise = courseKeywordSearchFunction({ keyword });
    return from(resultPromise); // Convert the Promise to an Observable
  }
}
