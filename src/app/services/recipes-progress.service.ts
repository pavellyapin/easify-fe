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
export class RecipesProgressService {
  constructor(
    private firestore: Firestore,
    private auth: Auth,
  ) {}

  async addRecipeStart(recipe: any, progress?: any) {
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
          progress: progress ? progress : null,
          status: 'started',
          createdAt: new Date(),
        };
        await addDoc(userRecipesCollectionRef, userRecipeData);
      } else {
        // If document exists, update it
        const docRef = querySnapshot.docs[0]!.ref;
        await updateDoc(docRef, {
          updatedAt: new Date(),
        });
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

  async getStartedRecipeById(recipeId: string): Promise<any | null> {
    try {
      const userRef = doc(this.firestore, 'users', this.auth.currentUser?.uid!);
      const userRecipesCollectionRef = collection(userRef, 'recipes');

      // Query to find the recipe by its ID and status 'started'
      const recipeQuery = query(
        userRecipesCollectionRef,
        where('recipe.id', '==', recipeId),
        limit(1),
      );

      const recipeSnapshot = await getDocs(recipeQuery);
      if (!recipeSnapshot.empty) {
        const startedRecipe = recipeSnapshot.docs[0]?.data();
        return startedRecipe;
      } else {
        console.log(`No started recipe found with ID: ${recipeId}`);
        return null;
      }
    } catch (error: any) {
      console.error('Error fetching started recipe by ID:', error);
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

  async getLatestStartedRecipe() {
    try {
      const userRef = doc(this.firestore, 'users', this.auth.currentUser?.uid!);
      const userRecipesCollectionRef = collection(userRef, 'recipes');

      // Query to get the latest started recipe (based on createdAt)
      const latestRecipeQuery = query(
        userRecipesCollectionRef,
        where('status', '==', 'started'),
        orderBy('createdAt', 'desc'),
        limit(1),
      );

      const latestRecipeSnapshot = await getDocs(latestRecipeQuery);
      if (!latestRecipeSnapshot.empty) {
        const latestRecipe = latestRecipeSnapshot.docs[0]?.data();
        return latestRecipe;
      } else {
        console.log('No started recipes found.');
        return null;
      }
    } catch (error: any) {
      console.error('Error getting latest started recipe', error);
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

  async updateRecipeProgress(
    recipeId: string,
    progress: {
      progress: number;
      prepComplete: boolean;
    },
  ): Promise<void> {
    try {
      const userRef = doc(this.firestore, 'users', this.auth.currentUser?.uid!);
      const userRecipesCollectionRef = collection(userRef, 'recipes');

      // Query to find the recipe by its ID
      const recipeQuery = query(
        userRecipesCollectionRef,
        where('recipe.id', '==', recipeId),
        limit(1),
      );

      const recipeSnapshot = await getDocs(recipeQuery);
      if (!recipeSnapshot.empty) {
        const docRef = recipeSnapshot.docs[0]!.ref;

        // Update the progress field in the document
        await updateDoc(docRef, {
          progress: {
            progress: progress.progress,
            prepComplete: progress.prepComplete,
          },
          updatedAt: new Date(),
        });
      } else {
        console.log(`No started recipe found with ID: ${recipeId}`);
      }
    } catch (error: any) {
      console.error('Error updating recipe progress:', error);
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
}
