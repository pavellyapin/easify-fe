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
  Firestore,
  collection,
  collectionData,
  doc,
  getDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CoursesService {
  constructor(private firestore: Firestore) {}

  getAllCourses(): Observable<any> {
    const coursesCollectionRef = collection(this.firestore, 'courses');
    return collectionData(coursesCollectionRef, {
      idField: 'id',
    }) as Observable<any>;
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
}
