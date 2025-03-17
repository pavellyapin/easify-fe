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
import { selectLifestyleHealth } from '@store/user/user.selector';
import { from, map, Observable, of, switchMap, take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FitnessWorkoutsService {
  constructor(
    private firestore: Firestore,
    private functions: Functions,
    private store: Store,
  ) {}

  getAllWorkouts(): Observable<any> {
    const workoutsCollectionRef = collection(this.firestore, 'workouts');
    return collectionData(workoutsCollectionRef, {
      idField: 'id',
    }).pipe(
      map((workouts: DocumentData[]) =>
        workouts.map((workout) => ({
          id: workout['id'],
          name: workout['name'],
          level: workout['difficulty'],
          overview: workout['description'],
          tags: workout['tags'],
        })),
      ),
    ) as Observable<any>;
  }

  async getWorkoutById(id: string): Promise<any> {
    const workoutDocRef = doc(this.firestore, `workouts/${id}`);
    const workoutDoc = await getDoc(workoutDocRef);
    if (workoutDoc.exists()) {
      return workoutDoc.data();
    } else {
      throw new Error(`Workout with ID ${id} not found`);
    }
  }

  recommendWorkouts(workoutTags: string[], count: any): Observable<any> {
    const recommendWorkoutsFunction = httpsCallable(
      this.functions,
      'recommendWorkouts',
    );
    const resultPromise = recommendWorkoutsFunction({ workoutTags, count });
    return from(resultPromise); // Convert the Promise to an Observable
  }

  getAllWorkoutTags(): Observable<string[]> {
    const tagCountsRef = doc(this.firestore, 'tagCounts/workoutTags');

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

  getAllWorkoutCategories(): Observable<string[]> {
    const categoryCountsRef = doc(this.firestore, 'tagCounts/workoutCategory');

    return from(getDoc(categoryCountsRef)).pipe(
      map((docSnapshot) => {
        const categoryData = docSnapshot.data() || { categories: [] };

        // Extract the category names from the array of objects
        return categoryData['categories'].map(
          (categoryObj: { category: string; count: number }) =>
            categoryObj.category,
        );
      }),
    );
  }

  getCategoryFilters(): Observable<string[]> {
    return this.store.select(selectLifestyleHealth).pipe(
      take(1),
      switchMap((lifestyleHealth) => {
        const lifestyleCategories = lifestyleHealth?.workoutCategories;

        // If categories exist in lifestyleHealth, return them as an Observable
        if (lifestyleCategories && lifestyleCategories.length > 0) {
          return of(lifestyleCategories);
        }

        // If no lifestyle categories exist, return an Observable from the Promise
        return from(this.getTopCategoriesFromTagCounts());
      }),
    );
  }

  private async getTopCategoriesFromTagCounts(): Promise<string[]> {
    const tagCountsRef = doc(this.firestore, 'tagCounts/workoutCategory');
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
  // New method to call the filterWorkouts function
  filterWorkouts(
    filters: {
      categories?: string[];
      levels?: string[];
      isNew?: boolean;
      sortBy?: string;
    },
    count: number,
    lastWorkout: any = null, // Pass the last workout for pagination (batch loading)
  ): Observable<any> {
    const filterWorkoutsFunction = httpsCallable(
      this.functions,
      'filterWorkouts',
    );

    const requestPayload = {
      ...filters,
      count,
      lastWorkout,
    };

    const resultPromise = filterWorkoutsFunction(requestPayload);
    return from(resultPromise); // Convert the Promise to an Observable
  }

  workoutKeywordSearch(keyword: string): Observable<any> {
    const workoutKeywordSearchFunction = httpsCallable(
      this.functions,
      'workoutKeywordSearch',
    );
    const resultPromise = workoutKeywordSearchFunction({ keyword });
    return from(resultPromise); // Convert the Promise to an Observable
  }
}
