/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
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
  Firestore,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FinancialProgressService {
  constructor(
    private firestore: Firestore,
    private auth: Auth,
  ) {}

  async addPortfolioStart(portfolio: any, progress?: any) {
    try {
      const userRef = doc(this.firestore, 'users', this.auth.currentUser?.uid!);
      const userPlansCollectionRef = collection(userRef, 'portfolios');
      const q = query(
        userPlansCollectionRef,
        where('portfolio.id', '==', portfolio.id),
      );
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        // If no existing document, create a new one
        const userPlanData = {
          portfolio,
          progress: progress ? progress : null,
          status: 'started',
          createdAt: new Date(),
        };
        await addDoc(userPlansCollectionRef, userPlanData);
      } else {
        // If document exists, update it
        const docRef = querySnapshot.docs[0]!.ref;
        await updateDoc(docRef, {
          updatedAt: new Date(),
        });
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

  getStartedPortfolios(): Observable<any[]> {
    const userRef = doc(this.firestore, 'users', this.auth.currentUser?.uid!);
    const userPortfoliosCollectionRef = collection(userRef, 'portfolios');

    // Query to find plans with status 'started'
    const startedPortfolioQuery = query(
      userPortfoliosCollectionRef,
      where('status', '==', 'started'),
    );

    return collectionData(startedPortfolioQuery, {
      idField: 'id',
    });
  }

  async getStartedPortfolioById(portfolioId: string): Promise<any | null> {
    try {
      const userRef = doc(this.firestore, 'users', this.auth.currentUser?.uid!);
      const userPortfolioCollectionRef = collection(userRef, 'portfolios');

      const portfolioQuery = query(
        userPortfolioCollectionRef,
        where('portfolio.id', '==', portfolioId),
        limit(1),
      );

      const portfolioSnapshot = await getDocs(portfolioQuery);
      if (!portfolioSnapshot.empty) {
        const startedPortfolio = portfolioSnapshot.docs[0]?.data();
        return startedPortfolio;
      } else {
        console.log(`No started portfolio found with ID: ${portfolioId}`);
        return null;
      }
    } catch (error: any) {
      console.error('Error fetching started portfolio by ID:', error);
      if (error.code) {
        console.error(`Error Code: ${error.code}`);
      }
      if (error.message) {
        console.error(`Error Message: ${error.message}`);
      }
      if (error.details) {
        console.error(`Error Details: ${error.details}`);
      }
      return null;
    }
  }

  async getEasifyResponsesByItemId(itemId: string): Promise<any[]> {
    try {
      // Reference to the user's document
      const userRef = doc(this.firestore, 'users', this.auth.currentUser?.uid!);
      // Reference to the 'easifyResponses' sub-collection
      const easifyResponsesCollectionRef = collection(
        userRef,
        'easifyResponses',
      );

      // Query to fetch all documents with the specified itemId
      const responsesQuery = query(
        easifyResponsesCollectionRef,
        where('itemId', '==', itemId),
        orderBy('timestamp', 'desc'), // Order responses by timestamp (latest first)
      );

      const querySnapshot = await getDocs(responsesQuery);

      if (!querySnapshot.empty) {
        // Map the documents to an array of data
        const responses = querySnapshot.docs.map((doc) => ({
          id: doc.id, // Include document ID for reference
          ...doc.data(),
        }));
        return responses;
      } else {
        return [];
      }
    } catch (error: any) {
      console.error('Error fetching Easify responses:', error);
      if (error.code) {
        console.error(`Error Code: ${error.code}`);
      }
      if (error.message) {
        console.error(`Error Message: ${error.message}`);
      }
      if (error.details) {
        console.error(`Error Details: ${error.details}`);
      }
      return [];
    }
  }

  async updatePortfolioProgress(
    portfolioId: string,
    progress: {
      totalTickers: number;
      completeTickers: number;
      progress: number;
      assetClass: any;
    },
  ): Promise<void> {
    try {
      const userRef = doc(this.firestore, 'users', this.auth.currentUser?.uid!);
      const userPortfoliosCollectionRef = collection(userRef, 'portfolios');

      // Query to find the portfolio by its ID
      const portfolioQuery = query(
        userPortfoliosCollectionRef,
        where('portfolio.id', '==', portfolioId),
        limit(1),
      );

      const portfolioSnapshot = await getDocs(portfolioQuery);
      if (!portfolioSnapshot.empty) {
        const docRef = portfolioSnapshot.docs[0]!.ref;

        // Update the progress field in the document
        await updateDoc(docRef, {
          progress: {
            totalTickers: progress.totalTickers,
            completeTickers: progress.completeTickers,
            progress: progress.progress,
            assetClass: progress.assetClass,
          },
          updatedAt: new Date(),
        });
      } else {
        console.log(`No started portfolio found with ID: ${portfolioId}`);
      }
    } catch (error: any) {
      console.error('Error updating portfolio progress:', error);
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
}
