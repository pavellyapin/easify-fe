/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-confusing-void-expression */
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
  Firestore,
  addDoc,
  collection,
  collectionData,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
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
import { Store } from '@ngrx/store';
import * as StartedGrowthActions from '@store/started-growth/started-growth.actions';
import { Observable, from } from 'rxjs';
import { EasifyService } from './easify.service';

@Injectable({
  providedIn: 'root',
})
export class GrowthProgressService {
  constructor(
    private storage: Storage,
    private auth: Auth,
    private firestore: Firestore,
    private easifyService: EasifyService,
    private functions: Functions,
    private store: Store,
  ) {}

  // Function to add or update a started industry
  async addIndustryStart(industry: any, progress?: any) {
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
          progress: progress ? progress : null,
          status: 'started',
          createdAt: new Date(),
        };
        await addDoc(userIndustriesCollectionRef, userIndustryData);
      } else {
        // If document exists, update it
        const docRef = querySnapshot.docs[0]!.ref;
        await updateDoc(docRef, {
          updatedAt: new Date(),
        });
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
          console.log('uploadProgress', uploadProgress);
        })
        .bind(uploadProgress);

      // Get the download URL once the upload is complete
      uploadTask
        .then(() => {
          getDownloadURL(storageRef)
            .then((url) => {
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
        fileName,
        fileUrl,
        uploadedAt: new Date().toISOString(),
      };

      // Save resume details to Firestore
      await setDoc(resumeDocRef, resumeData);

      // Trigger scanning of the resume and fetch mini-resume
      this.easifyService.scanResume(fileName);
    } catch (error) {
      console.error(
        'Error saving upload details or fetching mini resume:',
        error,
      );
      this.store.dispatch(
        StartedGrowthActions.loadMiniResumeFailure({ error }),
      );
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

  async getUserMiniResume(): Promise<any> {
    const user = this.auth.currentUser;

    if (user) {
      const userId = user.uid;
      const resumesCollectionRef = collection(
        this.firestore,
        `users/${userId}/resumes`,
      );

      try {
        // Fetch all resumes
        const querySnapshot = await getDocs(resumesCollectionRef);
        const resumes = querySnapshot.docs.map((doc) => ({
          id: doc.id, // Include the document ID
          ...doc.data(), // Spread the document data
        }));

        if (resumes.length === 0) {
          console.log('No resumes found.');
          return null;
        }

        // Get the first resume
        const firstResume = resumes[0];

        // Fetch the miniScan document for the first resume
        const miniScanDocRef = doc(
          this.firestore,
          `users/${userId}/resumes/${firstResume!.id}/reports/miniScan`,
        );

        const miniScanSnapshot = await getDoc(miniScanDocRef);

        if (miniScanSnapshot.exists()) {
          const miniScanData = miniScanSnapshot.data();
          return miniScanData;
        } else {
          console.log('No miniScan document found.');
          return null;
        }
      } catch (error) {
        console.error('Error fetching mini resume:', error);
        return null;
      }
    } else {
      console.error('User not authenticated.');
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

  async getStartedIndustryById(industryId: string): Promise<any | null> {
    try {
      const userRef = doc(this.firestore, 'users', this.auth.currentUser?.uid!);
      const userPortfolioCollectionRef = collection(userRef, 'industries');

      const portfolioQuery = query(
        userPortfolioCollectionRef,
        where('industry.id', '==', industryId),
        limit(1),
      );

      const portfolioSnapshot = await getDocs(portfolioQuery);
      if (!portfolioSnapshot.empty) {
        const startedPortfolio = portfolioSnapshot.docs[0]?.data();
        return startedPortfolio;
      } else {
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
}
