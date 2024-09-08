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
export class RecipesService {
  constructor(
    private firestore: Firestore,
    private functions: Functions,
    private auth: Auth,
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

  async addRecipeStart(recipe: any) {
    try {
      const userRef = doc(this.firestore, 'users', this.auth.currentUser?.uid!);
      const userRecipesCollectionRef = collection(userRef, 'recipes');
      const q = query(
        userRecipesCollectionRef,
        where('recipe.id', '==', recipe.id),
      );
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        // If no existing document, create a new one
        const userRecipeData = {
          recipe,
          status: 'started',
          createdAt: new Date(),
        };
        await addDoc(userRecipesCollectionRef, userRecipeData);
        console.log('User Recipe data saved to Firestore');
      } else {
        // If document exists, update it
        const docRef = querySnapshot.docs[0]!.ref;
        await updateDoc(docRef, {
          updatedAt: new Date(),
        });
        console.log('User Recipe data updated in Firestore');
      }
    } catch (error: any) {
      console.error('Error saving User Recipe data to Firestore:', error);
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

  async setFavoriteRecipe(recipeId: string) {
    try {
      const userRef = doc(this.firestore, 'users', this.auth.currentUser?.uid!);
      const userRecipesCollectionRef = collection(userRef, 'recipes');

      // Query to find if the recipe already exists in the user's recipes collection
      const q = query(
        userRecipesCollectionRef,
        where('recipe.id', '==', recipeId),
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log(`Recipe with ID ${recipeId} not found for this user.`);
      } else {
        // If the recipe is found, update its status to 'favorite'
        const docRef = querySnapshot.docs[0]!.ref;
        await updateDoc(docRef, {
          status: 'favorite',
          updatedAt: new Date(),
        });
        console.log(`Recipe with ID ${recipeId} marked as favorite.`);
      }
    } catch (error: any) {
      console.error('Error updating recipe status to favorite:', error);
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

  getStartedRecipes(): Observable<any[]> {
    const userRef = doc(this.firestore, 'users', this.auth.currentUser?.uid!);
    const userRecipesCollectionRef = collection(userRef, 'recipes');

    // Query to find recipes with status 'started'
    const startedRecipesQuery = query(
      userRecipesCollectionRef,
      where('status', '==', 'started'),
    );

    return collectionData(startedRecipesQuery, {
      idField: 'id',
    }) as Observable<any[]>;
  }

  getAllRecipeKeywords(): Observable<string[]> {
    const keywordCountsRef = doc(this.firestore, 'tagCounts/recipeKeywords');

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

  findRecipesByIngredients(ingredients: string[]): Observable<any> {
    const findRecipesFunction = httpsCallable(
      this.functions,
      'findRecipesByIngredients',
    );
    const resultPromise = findRecipesFunction({ ingredients });
    return from(resultPromise); // Convert the Promise to an Observable
  }
}
