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
import { Auth } from '@angular/fire/auth';
import {
  addDoc,
  collection,
  collectionData,
  doc,
  DocumentData,
  Firestore,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { from, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FinancialPlansService {
  constructor(
    private firestore: Firestore,
    private functions: Functions,
    private auth: Auth,
  ) {}

  getAllPlans(): Observable<any> {
    const plansCollectionRef = collection(this.firestore, 'financialPlans');
    return collectionData(plansCollectionRef, {
      idField: 'id',
    }).pipe(
      map((plans: DocumentData[]) =>
        plans.map((plan) => ({
          id: plan['id'],
          name: plan['name'],
          type: plan['type'],
          description: plan['description'],
          steps: plan['steps'],
        })),
      ),
    ) as Observable<any>;
  }

  async getPlanById(id: string): Promise<any> {
    const planDocRef = doc(this.firestore, `financialPlans/${id}`);
    const planDoc = await getDoc(planDocRef);
    if (planDoc.exists()) {
      return planDoc.data();
    } else {
      throw new Error(`Plan with ID ${id} not found`);
    }
  }

  recommendPlans(financialTags: string[], count: any): Observable<any> {
    const recommendPlansFunction = httpsCallable(
      this.functions,
      'recommendFinancialPlans',
    );
    const resultPromise = recommendPlansFunction({ financialTags, count });
    return from(resultPromise); // Convert the Promise to an Observable
  }

  async addPlanStart(plan: any) {
    try {
      const userRef = doc(this.firestore, 'users', this.auth.currentUser?.uid!);
      const userPlansCollectionRef = collection(userRef, 'financialPlans');
      const q = query(userPlansCollectionRef, where('plan.id', '==', plan.id));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        // If no existing document, create a new one
        const userPlanData = {
          plan,
          status: 'started',
          createdAt: new Date(),
        };
        await addDoc(userPlansCollectionRef, userPlanData);
        console.log('User Plan data saved to Firestore');
      } else {
        // If document exists, update it
        const docRef = querySnapshot.docs[0]!.ref;
        await updateDoc(docRef, {
          updatedAt: new Date(),
        });
        console.log('User Plan data updated in Firestore');
      }
    } catch (error: any) {
      console.error('Error saving User Plan data to Firestore:', error);
      if (error.code) {
        console.error(`Error Code: ${error.code}`);
      }
      if (error.message) {
        console.error(`Error Message: ${error.message}`);
      }
      if (error.details) {
        console.error(`Error Details: ${error.details}`);
      }
    }
  }

  getStartedPlans(): Observable<any[]> {
    const userRef = doc(this.firestore, 'users', this.auth.currentUser?.uid!);
    const userPlansCollectionRef = collection(userRef, 'financialPlans');

    // Query to find plans with status 'started'
    const startedPlansQuery = query(
      userPlansCollectionRef,
      where('status', '==', 'started'),
    );

    return collectionData(startedPlansQuery, {
      idField: 'id',
    }) as Observable<any[]>;
  }

  getAllPlanTags(): Observable<string[]> {
    const tagCountsRef = doc(this.firestore, 'tagCounts/financialTags');

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

  getAllPlanCategories(): Observable<string[]> {
    const categoryCountsRef = doc(
      this.firestore,
      'tagCounts/financialCategories',
    );

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

  getRandomPlanCategories(): Observable<string[]> {
    const categoryCountsRef = doc(
      this.firestore,
      'tagCounts/financialCategories',
    );

    return from(getDoc(categoryCountsRef)).pipe(
      map((docSnapshot) => {
        const categoryData = docSnapshot.data() || { categories: [] };

        // Extract the category names from the array of objects and sort by count
        const topCategories = categoryData['categories']
          .sort(
            (a: { count: number }, b: { count: number }) => b.count - a.count,
          ) // Sort categories by count (descending)
          .slice(0, 20) // Get the top 20 categories
          .map((categoryObj: { category: string }) => categoryObj.category); // Extract the category names

        // Return a random sample of 3 categories from the top 20
        return this.getRandomSample(topCategories, 3);
      }),
    );
  }

  // Helper function to get a random sample from an array
  private getRandomSample<T>(array: T[], sampleSize: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random()); // Shuffle the array
    return shuffled.slice(0, sampleSize); // Return the first 'sampleSize' elements
  }
}
