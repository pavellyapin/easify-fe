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
export class CoursesService {
  constructor(
    private firestore: Firestore,
    private functions: Functions,
    private auth: Auth,
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

  recommendCourses(courseTags: string[], count: any): Observable<any> {
    const recommendCoursesFunction = httpsCallable(
      this.functions,
      'recommendCourses',
    );
    const resultPromise = recommendCoursesFunction({ courseTags, count });
    return from(resultPromise); // Convert the Promise to an Observable
  }

  async addCourseStart(course: any) {
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
          status: 'started',
          createdAt: new Date(),
        };
        await addDoc(userCoursesCollectionRef, userCourseData);
        console.log('User Course data saved to Firestore');
      } else {
        // If document exists, update it
        const docRef = querySnapshot.docs[0]!.ref;
        await updateDoc(docRef, {
          updatedAt: new Date(),
        });
        console.log('User Course data updated in Firestore');
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
}
