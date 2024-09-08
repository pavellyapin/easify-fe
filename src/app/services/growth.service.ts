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
  collection,
  doc,
  getDocs,
  setDoc,
} from '@angular/fire/firestore';
import {
  Storage,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from '@angular/fire/storage';
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
  ) {}

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
}
