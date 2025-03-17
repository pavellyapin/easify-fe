/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
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

import { DatePipe } from '@angular/common';
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
import { AssetClass, AssetClassLabels } from '@store/fitness/finance.model';
import { selectFinancialPlanning } from '@store/user/user.selector';
import { from, map, Observable, of, switchMap, take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FinancialPlansService {
  constructor(
    private firestore: Firestore,
    private functions: Functions,
    private store: Store,
    private datePipe: DatePipe,
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

  async getPortfolioById(id: string): Promise<any> {
    const planDocRef = doc(this.firestore, `portfolios/${id}`);
    const planDoc = await getDoc(planDocRef);
    if (planDoc.exists()) {
      return planDoc.data();
    } else {
      throw new Error(`Plan with ID ${id} not found`);
    }
  }

  getAllPlanTags(): Observable<string[]> {
    const tagCountsRef = doc(this.firestore, 'tagCounts/portfolioTags');

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

  recommendPortfolios(portfolioTags: string[], count: any): Observable<any> {
    const recommendPortfoliosFunction = httpsCallable(
      this.functions,
      'recommendPortfolios',
    );
    const resultPromise = recommendPortfoliosFunction({ portfolioTags, count });
    return from(resultPromise); // Convert the Promise to an Observable
  }

  getAllPortfolioCategories(): Observable<string[]> {
    const categoryCountsRef = doc(
      this.firestore,
      'tagCounts/portfolioCategories',
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

  getCategoryFilters(): Observable<string[]> {
    return this.store.select(selectFinancialPlanning).pipe(
      take(1),
      switchMap((financialPlanning) => {
        const portfolioCategories = financialPlanning?.planCategories;

        // If categories exist in lifestyleHealth, return them as an Observable
        if (portfolioCategories && portfolioCategories.length > 0) {
          return of(portfolioCategories);
        }

        // If no lifestyle categories exist, return an Observable from the Promise
        return from(this.getTopCategoriesFromTagCounts());
      }),
    );
  }

  private async getTopCategoriesFromTagCounts(): Promise<string[]> {
    const tagCountsRef = doc(this.firestore, 'tagCounts/portfolioCategories');
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
  filterPortfolios(
    filters: {
      categories?: string[];
      riskLevels?: string[];
      isNew?: boolean;
      sortBy?: string;
    },
    count: number,
    lastPortfolio: any = null, // Pass the last workout for pagination (batch loading)
  ): Observable<any> {
    const filterPortfoliosFunction = httpsCallable(
      this.functions,
      'filterPortfolios',
    );

    const requestPayload = {
      ...filters,
      count,
      lastPortfolio,
    };

    const resultPromise = filterPortfoliosFunction(requestPayload);
    return from(resultPromise); // Convert the Promise to an Observable
  }

  getLevelIcon(level: string): string {
    switch (level.toLowerCase()) {
      case 'low':
        return 'beginner'; // Name of the icon for Beginner
      case 'moderate':
        return 'intermediate'; // Name of the icon for Intermediate
      case 'advanced':
        return 'high'; // Name of the icon for Advanced
      default:
        return 'intermediate'; // Fallback icon
    }
  }
  prepareProgressData(summaries: any[]): any[] {
    if (!summaries || summaries.length === 0) {
      return [];
    }

    // ✅ Filter values to include only dates ending in "-01" (start of the month)
    const filteredPortfolioValues = summaries.filter((value) => {
      const dateParts = value.date.split('-');
      return dateParts[2] === '01';
    });

    // ✅ Sort portfolio values by date (ascending)
    const sortedSummaries = filteredPortfolioValues.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    // ✅ Define asset classes
    const assetClasses = [
      'usEquitiesValue',
      'internationalEquitiesValue',
      'emergingMarketEquitiesValue',
      'globalEquitiesValue',
      'bondsValue',
      'goldValue',
      'cryptoValue',
    ];

    return [
      {
        name: 'Total Portfolio Value',
        series: sortedSummaries.map((summary) => {
          // ✅ Prepare formatted values for each asset class to show in tooltip
          const tooltipData = assetClasses.reduce<Record<string, string>>(
            (acc, assetClass) => {
              acc[assetClass] = this.formatCurrency(summary[assetClass] || 0);
              return acc;
            },
            {},
          );

          return {
            name: this.formatDate(summary.date), // Convert date to "Jan 1st, 2019"
            value: summary.totalValue,
            formattedValue: this.formatCurrency(summary.totalValue),
            tooltipData, // ✅ Include all asset class values for tooltip
          };
        }),
      },
    ];
  }

  prepareHoldingData(summaries: any[]): any[] {
    if (!summaries || summaries.length === 0) {
      return [];
    }

    // ✅ Filter values to include only dates ending in "-01" (start of the month)
    const filteredPortfolioValues = summaries.filter((value) => {
      const dateParts = value.date.split('-');
      return dateParts[2] === '01';
    });

    // ✅ Sort portfolio values by date (ascending)
    const sortedSummaries = filteredPortfolioValues.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    return [
      {
        name: 'Total Portfolio Value',
        series: sortedSummaries.map((summary) => {
          return {
            name: this.formatDate(summary.date), // Convert date to "Jan 1st, 2019"
            value: summary.value,
            formattedValue: this.formatCurrency(summary.value),
          };
        }),
      },
    ];
  }

  // ✅ Helper function to format asset class names for better UI display
  public formatAssetName(assetClass: string): string {
    const assetNameMap: Record<string, string> = {
      usEquitiesValue: 'US Equities',
      internationalEquitiesValue: 'International Equities',
      emergingMarketEquitiesValue: 'Emerging Market Equities',
      globalEquitiesValue: 'Global Equities',
      bondsValue: 'Bonds',
      goldValue: 'Gold',
      cryptoValue: 'Cryptocurrencies',
    };
    return assetNameMap[assetClass] || assetClass;
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    const formattedDate = this.datePipe.transform(date, 'MMM d, y'); // "Jan 1, 2019"

    // Convert day (1, 2, 3, etc.) to ordinal format (1st, 2nd, 3rd)
    const day = date.getDate();
    const suffix = this.getOrdinalSuffix(day);

    return formattedDate?.replace(/\d+/, `${day}${suffix}`) ?? dateString;
  }

  private getOrdinalSuffix(day: number): string {
    if (day >= 11 && day <= 13) return 'th'; // Special case for 11th, 12th, 13th
    switch (day % 10) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  }

  public formatCurrency(value: number): string {
    return `$${value.toFixed(2)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','); // "$10,000.00"
  }

  getAssetClassLabel(assetClass: string): string {
    const assetClassEnum = Object.values(AssetClass).find(
      (value) => value === assetClass,
    ) as AssetClass | undefined;

    return assetClassEnum
      ? AssetClassLabels[assetClassEnum]
      : 'Unknown Asset Class';
  }

  portfolioKeywordSearch(keyword: string): Observable<any> {
    const portfolioKeywordSearchFunction = httpsCallable(
      this.functions,
      'portfolioKeywordSearch',
    );
    const resultPromise = portfolioKeywordSearchFunction({ keyword });
    return from(resultPromise); // Convert the Promise to an Observable
  }
}
