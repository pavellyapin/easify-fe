/* eslint-disable @typescript-eslint/await-thenable */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/use-unknown-in-catch-callback-variable */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import {
  DocumentData,
  Firestore,
  addDoc,
  collection,
  collectionData,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Functions, httpsCallable } from '@angular/fire/functions';
import {
  Storage,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from '@angular/fire/storage';
import { Observable, from, map } from 'rxjs';
import { EasifyService } from './easify.service';

@Injectable({
  providedIn: 'root',
})
export class GrowthService {
  constructor(
    private storage: Storage,
    private auth: Auth,
    private firestore: Firestore,
    private easifyService: EasifyService,
    private functions: Functions,
  ) {}

  // Function to add or update a started industry
  async addIndustryStart(industry: any) {
    try {
      const userRef = doc(this.firestore, 'users', this.auth.currentUser?.uid!);
      const userIndustriesCollectionRef = collection(userRef, 'industries');

      // Query to check if the industry has already been started by the user
      const q = query(
        userIndustriesCollectionRef,
        where('industry.id', '==', industry.id),
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // If no existing document, create a new one
        const userIndustryData = {
          industry,
          status: 'started',
          createdAt: new Date(),
        };
        await addDoc(userIndustriesCollectionRef, userIndustryData);
        console.log('User Industry data saved to Firestore');
      } else {
        // If document exists, update it
        const docRef = querySnapshot.docs[0]!.ref;
        await updateDoc(docRef, {
          updatedAt: new Date(),
        });
        console.log('User Industry data updated in Firestore');
      }
    } catch (error: any) {
      console.error('Error saving User Industry data to Firestore:', error);
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

  // Function to retrieve started industries for the current user
  getStartedIndustries(): Observable<any[]> {
    const userRef = doc(this.firestore, 'users', this.auth.currentUser?.uid!);
    const userIndustriesCollectionRef = collection(userRef, 'industries');

    // Query to find industries with status 'started'
    const startedIndustriesQuery = query(
      userIndustriesCollectionRef,
      where('status', '==', 'started'),
    );

    // Return observable with the started industries
    return collectionData(startedIndustriesQuery, {
      idField: 'id',
    }) as Observable<any[]>;
  }

  // Handle file upload when "Upload" button is clicked
  uploadResume(file: any, uploadProgress: any) {
    const user = this.auth.currentUser;

    if (user && file) {
      const userId = user.uid;
      const bucketName = 'easify-resumes'; // Specify the target bucket
      const filePath = `${userId}/${file.name}`; // Folder is the user's ID
      const storageRef = ref(this.storage, `gs://${bucketName}/${filePath}`); // Reference to the file in the specified bucket

      // Upload the file to Firebase Storage
      const uploadTask = uploadBytesResumable(storageRef, file);

      // Monitor upload progress
      uploadTask
        .on('state_changed', (snapshot) => {
          uploadProgress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        })
        .bind(uploadProgress);

      // Get the download URL once the upload is complete
      uploadTask
        .then(() => {
          getDownloadURL(storageRef)
            .then((url) => {
              console.log('File uploaded successfully! URL:', url);

              // Save upload details to Firestore
              this.saveUploadDetailsToFirestore(userId, file.name, url);
            })
            .catch((error) => {
              console.error('Error getting download URL:', error);
            });
        })
        .catch((error) => {
          console.error('Error during file upload:', error);
        });
    } else {
      console.error('User not authenticated or file not provided.');
    }
  }

  // Save upload details to Firestore and chain scanResume function
  private async saveUploadDetailsToFirestore(
    userId: string,
    fileName: string,
    fileUrl: string,
  ) {
    try {
      const resumeDocRef = doc(
        this.firestore,
        `users/${userId}/resumes/${fileName}`,
      );
      const resumeData = {
        fileName: fileName,
        fileUrl: fileUrl,
        uploadedAt: new Date().toISOString(),
      };

      // Set document in Firestore
      await setDoc(resumeDocRef, resumeData);

      // Subscribe to the scanResume observable
      this.easifyService.scanResume(fileName).subscribe({
        next: () => console.log('Resume sent for scanning'),
        error: (error) => console.error('Error scanning resume:', error),
      });

      console.log('Upload details saved to Firestore');
    } catch (error) {
      console.error('Error saving upload details or scanning resume:', error);
    }
  }

  // Fetch all resumes for the user
  async getUserResumes(): Promise<any[]> {
    const user = this.auth.currentUser;

    if (user) {
      const userId = user.uid;
      const resumesCollectionRef = collection(
        this.firestore,
        `users/${userId}/resumes`,
      );

      try {
        const querySnapshot = await getDocs(resumesCollectionRef);
        const resumes = querySnapshot.docs.map((doc) => ({
          id: doc.id, // Include the document ID
          ...doc.data(), // Spread the document data
        }));

        console.log('Fetched resumes:', resumes);
        return resumes;
      } catch (error) {
        console.error('Error fetching resumes:', error);
        return [];
      }
    } else {
      console.error('User not authenticated.');
      return [];
    }
  }

  // Fetch a specific industry by its ID
  async getIndustryById(industryId: string): Promise<any> {
    try {
      const industryDocRef = doc(this.firestore, `industries/${industryId}`);

      // Fetch the document snapshot from Firestore
      const industrySnapshot = await getDoc(industryDocRef);

      if (industrySnapshot.exists()) {
        const industryData = industrySnapshot.data();
        console.log('Fetched industry:', industryData);

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

  analyzeResumeAndMatchIndustries(): Observable<any> {
    const analyzeResumeFunction = httpsCallable(
      this.functions,
      'analyzeResumeAndMatchIndustries',
    );
    const resultPromise = analyzeResumeFunction();
    return from(resultPromise); // Convert the Promise to an Observable
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

  // Helper function to get a random sample from an array
  private getRandomSample<T>(array: T[], sampleSize: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random()); // Shuffle the array
    return shuffled.slice(0, sampleSize); // Return the first 'sampleSize' elements
  }
}
