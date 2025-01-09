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
export class CoursesProgressService {
  constructor(
    private firestore: Firestore,
    private auth: Auth,
  ) {}

  async addCourseStart(course: any, progress?: any) {
    try {
      const userRef = doc(this.firestore, 'users', this.auth.currentUser?.uid!);
      const userCoursesCollectionRef = collection(userRef, 'courses');
      const q = query(
        userCoursesCollectionRef,
        where('course.id', '==', course.id),
      );
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        // If no existing document, create a new one
        const userCourseData = {
          course,
          progress: progress ? progress : null,
          status: 'started',
          createdAt: new Date(),
        };
        await addDoc(userCoursesCollectionRef, userCourseData);
      } else {
        // If document exists, update it
        const docRef = querySnapshot.docs[0]!.ref;
        await updateDoc(docRef, {
          updatedAt: new Date(),
        });
      }
    } catch (error: any) {
      console.error('Error saving User Course data to Firestore:', error);
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

  async getStartedCourseById(courseId: string): Promise<any | null> {
    try {
      const userRef = doc(this.firestore, 'users', this.auth.currentUser?.uid!);
      const userCoursesCollectionRef = collection(userRef, 'courses');

      // Query to find the course by its ID and status 'started'
      const courseQuery = query(
        userCoursesCollectionRef,
        where('course.id', '==', courseId),
        limit(1),
      );

      const courseSnapshot = await getDocs(courseQuery);
      if (!courseSnapshot.empty) {
        const startedCourse = courseSnapshot.docs[0]?.data();
        return startedCourse;
      } else {
        console.log(`No started course found with ID: ${courseId}`);
        return null;
      }
    } catch (error: any) {
      console.error('Error fetching started course by ID:', error);
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

  async getLatestStartedCourse() {
    try {
      const userRef = doc(this.firestore, 'users', this.auth.currentUser?.uid!);
      const userCoursesCollectionRef = collection(userRef, 'courses');

      // Query to get the latest started course (based on createdAt)
      const latestCourseQuery = query(
        userCoursesCollectionRef,
        where('status', '==', 'started'),
        orderBy('createdAt', 'desc'),
        limit(1),
      );

      const latestCourseSnapshot = await getDocs(latestCourseQuery);
      if (!latestCourseSnapshot.empty) {
        const latestCourse = latestCourseSnapshot.docs[0]?.data();
        return latestCourse;
      } else {
        console.log('No started courses found.');
        return null;
      }
    } catch (error: any) {
      console.error('Error getting latest started course', error);
      if (error.code) {
        console.error(`Error Code: ${error.code}`);
      }
      if (error.message) {
        console.error(`Error Message: ${error.message}`);
      }
      if (error.details) {
        console.error(`Error Details: ${error.details}`);
      }
      return null; // Ensure the function returns null in the event of an error
    }
  }
  async updateCourseProgress(
    courseId: string,
    progress: {
      chapter: number;
      topic: number;
      progress: number;
      completeTopics: number;
      totalTopics: number;
    },
  ): Promise<void> {
    try {
      const userRef = doc(this.firestore, 'users', this.auth.currentUser?.uid!);
      const userCoursesCollectionRef = collection(userRef, 'courses');

      // Query to find the course by its ID
      const courseQuery = query(
        userCoursesCollectionRef,
        where('course.id', '==', courseId),
        limit(1),
      );

      const courseSnapshot = await getDocs(courseQuery);
      if (!courseSnapshot.empty) {
        const docRef = courseSnapshot.docs[0]!.ref;

        // Update the progress field in the document
        await updateDoc(docRef, {
          progress: {
            chapter: progress.chapter,
            topic: progress.topic,
            progress: progress.progress,
            completeTopics: progress.completeTopics,
            totalTopics: progress.totalTopics,
          },
          updatedAt: new Date(),
        });
      } else {
        console.log(`No started course found with ID: ${courseId}`);
      }
    } catch (error: any) {
      console.error('Error updating course progress:', error);
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

  getStartedCourses(): Observable<any[]> {
    const userRef = doc(this.firestore, 'users', this.auth.currentUser?.uid!);
    const userCoursesCollectionRef = collection(userRef, 'courses');

    // Query to find courses with status 'started'
    const startedCoursesQuery = query(
      userCoursesCollectionRef,
      where('status', '==', 'started'),
    );

    return collectionData(startedCoursesQuery, {
      idField: 'id',
    }) as Observable<any[]>;
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
        console.log(
          `Fetched ${responses.length} responses for itemId: ${itemId}`,
        );
        return responses;
      } else {
        console.log(`No Easify responses found for itemId: ${itemId}`);
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
