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
import { selectDietNutrition } from '@store/user/user.selector';
import { from, map, Observable, of, switchMap, take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RecipesService {
  constructor(
    private firestore: Firestore,
    private functions: Functions,
    private store: Store,
  ) {}

  getAllRecipes(): Observable<any> {
    const recipesCollectionRef = collection(this.firestore, 'recipes');
    return collectionData(recipesCollectionRef, {
      idField: 'id',
    }).pipe(
      map((recipes: DocumentData[]) =>
        recipes.map((recipe) => ({
          id: recipe['id'],
          createdDate: recipe['createdDate'],
          name: recipe['name'],
          description: recipe['description'],
          difficulty: recipe['difficulty'],
          cuisine: recipe['cuisine'],
          image: recipe['image'],
          tags: recipe['tags'],
        })),
      ),
    ) as Observable<any>;
  }

  async getRecipeById(id: string): Promise<any> {
    try {
      const courseDocRef = doc(this.firestore, `recipes/${id}`);
      const courseDoc = await getDoc(courseDocRef);

      if (courseDoc.exists()) {
        return courseDoc.data();
      } else {
        throw new Error(`Recipe with ID ${id} not found`);
      }
    } catch (error: any) {
      console.error(`Failed to fetch recipe with ID ${id}:`, error.message);
      throw new Error(`Failed to fetch recipe with ID ${id}`);
    }
  }

  recommendRecipes(mealTags: string[], count: any): Observable<any> {
    const recommendRecipesFunction = httpsCallable(
      this.functions,
      'recommendRecipes',
    );
    const resultPromise = recommendRecipesFunction({ mealTags, count });
    return from(resultPromise); // Convert the Promise to an Observable
  }

  recipeKeywordSearch(keyword: string): Observable<any> {
    const recipeKeywordSearchFunction = httpsCallable(
      this.functions,
      'recipeKeywordSearch',
    );
    const resultPromise = recipeKeywordSearchFunction({ keyword });
    return from(resultPromise); // Convert the Promise to an Observable
  }

  getAllRecipeKeywords(): Observable<string[]> {
    const keywordCountsRef = doc(this.firestore, 'tagCounts/recipeTags');

    return from(getDoc(keywordCountsRef)).pipe(
      map((docSnapshot) => {
        const keywordData = docSnapshot.data() || { tags: [] };

        // Extract the keyword names from the array of objects
        return keywordData['tags'].map(
          (keywordObj: { tag: string; count: number }) => keywordObj.tag,
        );
      }),
    );
  }

  getAllIngredients(): Observable<string[]> {
    const ingredientsRef = doc(this.firestore, 'tagCounts/recipeIngredients');

    return from(getDoc(ingredientsRef)).pipe(
      map((docSnapshot) => {
        const ingredientData = docSnapshot.data() || { ingredients: [] };

        // Extract the ingredient names from the array of objects
        const ingredientNames = ingredientData['ingredients'].map(
          (ingredientObj: any) => ingredientObj,
        );

        // Sort the ingredient names alphabetically
        return ingredientNames.sort((a: any, b: any) => a.localeCompare(b));
      }),
    );
  }

  getAllRecipeCuisines(): Observable<string[]> {
    const cuisinesRef = doc(this.firestore, 'tagCounts/recipeCuisines');

    return from(getDoc(cuisinesRef)).pipe(
      map((docSnapshot) => {
        const cuisineData = docSnapshot.data() || { cuisines: [] };

        // Extract the cuisine names from the array of objects
        const cuisineNames = cuisineData['cuisines'].map(
          (cuisineObj: any) => cuisineObj.cuisine,
        );

        // Sort the cuisine names alphabetically
        return cuisineNames.sort((a: string, b: string) => a.localeCompare(b));
      }),
    );
  }

  getCuisineFilters(): Observable<string[]> {
    return this.store.select(selectDietNutrition).pipe(
      take(1),
      switchMap((dietNutrition) => {
        const cuisines = dietNutrition?.nutritionCategories;

        // If categories exist in lifestyleHealth, return them as an Observable
        if (cuisines && cuisines.length > 0) {
          return of(cuisines);
        }

        // If no lifestyle categories exist, return an Observable from the Promise
        return from(this.getTopCuisinesFromTagCounts());
      }),
    );
  }

  private async getTopCuisinesFromTagCounts(): Promise<string[]> {
    const tagCountsRef = doc(this.firestore, 'tagCounts/recipeCuisines');
    const tagCountsDoc = await getDoc(tagCountsRef);

    if (tagCountsDoc.exists()) {
      const cuisinesData = tagCountsDoc.data()['cuisines'] || [];

      // Sort categories by count in descending order
      const sortedCuisines = cuisinesData
        .sort((a: any, b: any) => b.count - a.count)
        .map((cuisine: any) => cuisine.cuisine);

      // Return a random selection of 3 categories from the top 20
      const topCuisines = sortedCuisines.slice(0, 20);
      return this.getRandomSample(topCuisines, 3);
    }

    return [];
  }

  getRandomRecipeCuisines(): Observable<string[]> {
    const cuisinesRef = doc(this.firestore, 'tagCounts/recipeCuisines');

    return from(getDoc(cuisinesRef)).pipe(
      map((docSnapshot) => {
        const cuisineData = docSnapshot.data() || { cuisines: [] };

        // Extract the cuisine names from the array of objects and sort by count
        const topCuisines = cuisineData['cuisines']
          .sort(
            (a: { count: number }, b: { count: number }) => b.count - a.count,
          ) // Sort cuisines by count (descending)
          .slice(0, 20) // Get the top 20 cuisines
          .map((cuisineObj: { cuisine: string }) => cuisineObj.cuisine); // Extract the cuisine names

        // Return a random sample of 3 cuisines from the top 20
        return this.getRandomSample(topCuisines, 3);
      }),
    );
  }

  // Helper function to get a random sample from an array
  private getRandomSample<T>(array: T[], sampleSize: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random()); // Shuffle the array
    return shuffled.slice(0, sampleSize); // Return the first 'sampleSize' elements
  }

  findRecipesByIngredients(ingredients: string[]): Observable<any> {
    const findRecipesFunction = httpsCallable(
      this.functions,
      'findRecipesByIngredients',
    );
    const resultPromise = findRecipesFunction({ ingredients });
    return from(resultPromise); // Convert the Promise to an Observable
  }
  filterRecipes(
    filters: {
      categories?: string[];
      cuisines?: string[];
      levels?: string[];
      isNew?: boolean;
      sortBy?: string;
    },
    count: number,
    lastRecipe: any = null, // Pass the last workout for pagination (batch loading)
  ): Observable<any> {
    const filterRecipesFunction = httpsCallable(
      this.functions,
      'filterRecipes',
    );

    const requestPayload = {
      ...filters,
      count,
      lastRecipe,
    };

    const resultPromise = filterRecipesFunction(requestPayload);
    return from(resultPromise); // Convert the Promise to an Observable
  }
}
