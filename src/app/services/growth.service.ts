/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/await-thenable */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/use-unknown-in-catch-callback-variable */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import {
  DocumentData,
  Firestore,
  collection,
  collectionData,
  doc,
  getDoc,
} from '@angular/fire/firestore';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { Store } from '@ngrx/store';
import { selectWorkSkills } from '@store/user/user.selector';
import { Observable, from, map, of, switchMap, take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GrowthService {
  constructor(
    private firestore: Firestore,
    private functions: Functions,
    private store: Store,
  ) {}

  // Fetch a specific industry by its ID
  async getIndustryById(industryId: string): Promise<any> {
    try {
      const industryDocRef = doc(this.firestore, `industries/${industryId}`);

      // Fetch the document snapshot from Firestore
      const industrySnapshot = await getDoc(industryDocRef);

      if (industrySnapshot.exists()) {
        const industryData = industrySnapshot.data();

        // Return the industry data
        return { id: industrySnapshot.id, ...industryData };
      } else {
        console.error('No industry found with the given ID.');
        return null;
      }
    } catch (error) {
      console.error('Error fetching industry by ID:', error);
      return null;
    }
  }

  getAllIndustries(): Observable<any> {
    const industriesCollectionRef = collection(this.firestore, 'industries');
    return collectionData(industriesCollectionRef, {
      idField: 'id',
    }).pipe(
      map((industries: DocumentData[]) =>
        industries.map((industry) => ({
          id: industry['id'],
          name: industry['name'],
          tags: industry['tags'],
        })),
      ),
    ) as Observable<any>;
  }

  recommendIndustries(industryTags: string[], count: any): Observable<any> {
    const recommendIndustriesFunction = httpsCallable(
      this.functions,
      'recommendIndustries',
    );
    const resultPromise = recommendIndustriesFunction({ industryTags, count });
    return from(resultPromise); // Convert the Promise to an Observable
  }

  getAllIndustryTags(): Observable<string[]> {
    const tagCountsRef = doc(this.firestore, 'tagCounts/industryTags');

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

  getRandomTags(): Observable<string[]> {
    const tagCountsRef = doc(this.firestore, 'tagCounts/industryTags');

    return from(getDoc(tagCountsRef)).pipe(
      map((docSnapshot) => {
        const tagData = docSnapshot.data() || { tags: [] };

        // Extract the tag names from the array of objects and sort by count
        const topTags = tagData['tags']
          .sort(
            (a: { count: number }, b: { count: number }) => b.count - a.count,
          ) // Sort tags by count (descending)
          .slice(0, 20) // Get the top 20 tags
          .map((tagObj: { tag: string }) => tagObj.tag); // Extract the tag names

        // Return a random sample of 3 tags from the top 20
        return this.getRandomSample(topTags, 3);
      }),
    );
  }

  getIndustryFilters(): Observable<string[]> {
    return this.store.select(selectWorkSkills).pipe(
      take(1),
      switchMap((workSkills) => {
        const industries = workSkills?.industryCategories;

        // If categories exist in lifestyleHealth, return them as an Observable
        if (industries && industries.length > 0) {
          return of(industries);
        }

        // If no lifestyle categories exist, return an Observable from the Promise
        return from(this.getTopIndustriesFromTagCounts());
      }),
    );
  }

  private async getTopIndustriesFromTagCounts(): Promise<string[]> {
    const tagCountsRef = doc(this.firestore, 'tagCounts/industryTags');
    const tagCountsDoc = await getDoc(tagCountsRef);

    if (tagCountsDoc.exists()) {
      const industriesData = tagCountsDoc.data()['tags'] || [];

      // Sort categories by count in descending order
      const sortedIndustries = industriesData
        .sort((a: any, b: any) => b.count - a.count)
        .map((industry: any) => industry.tag);

      // Return a random selection of 3 categories from the top 20
      const topIndustries = sortedIndustries.slice(0, 20);
      return this.getRandomSample(topIndustries, 3);
    }

    return [];
  }

  filterIndustries(
    filters: {
      categories?: string[];
      tags?: string[];
      isNew?: boolean;
      sortBy?: string;
    },
    count: number,
    lastIndustry: any = null, // Pass the last workout for pagination (batch loading)
  ): Observable<any> {
    const filterIndustriesFunction = httpsCallable(
      this.functions,
      'filterIndustries',
    );

    const requestPayload = {
      ...filters,
      count,
      lastIndustry,
    };

    const resultPromise = filterIndustriesFunction(requestPayload);
    return from(resultPromise); // Convert the Promise to an Observable
  }

  // Helper function to get a random sample from an array
  private getRandomSample<T>(array: T[], sampleSize: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random()); // Shuffle the array
    return shuffled.slice(0, sampleSize); // Return the first 'sampleSize' elements
  }

  industryKeywordSearch(keyword: string): Observable<any> {
    const industryKeywordSearchFunction = httpsCallable(
      this.functions,
      'industryKeywordSearch',
    );
    const resultPromise = industryKeywordSearchFunction({ keyword });
    return from(resultPromise); // Convert the Promise to an Observable
  }
}
