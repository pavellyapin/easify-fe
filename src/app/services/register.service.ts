/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { setDoc, updateDoc } from '@angular/fire/firestore';
import { catchError, from, map, Observable, of } from 'rxjs';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class RegisterService {
  constructor(private userService: UserService) {}

  // Set Basic Info
  setBasicInfo(basicInfo: any): Observable<any> {
    const userDocRef = this.userService.getUserDocRef();
    if (!userDocRef) return of(null);

    return from(setDoc(userDocRef, { basicInfo }, { merge: true })).pipe(
      map(() => basicInfo),
      catchError((error) => {
        console.error('Error setting basic info:', error);
        return of(null);
      }),
    );
  }

  // Update Basic Info
  updateBasicInfo(basicInfo: any): Observable<any> {
    const userDocRef = this.userService.getUserDocRef();
    if (!userDocRef) return of(null);

    return from(updateDoc(userDocRef, { basicInfo })).pipe(
      map(() => basicInfo),
      catchError((error) => {
        console.error('Error updating basic info:', error);
        return of(null);
      }),
    );
  }

  // Set Diet Nutrition
  setDietNutrition(dietNutrition: any): Observable<any> {
    const userDocRef = this.userService.getUserDocRef();
    if (!userDocRef) return of(null);

    return from(setDoc(userDocRef, { dietNutrition }, { merge: true })).pipe(
      map(() => dietNutrition),
      catchError((error) => {
        console.error('Error setting diet nutrition:', error);
        return of(null);
      }),
    );
  }

  // Update Diet Nutrition
  updateDietNutrition(dietNutrition: any): Observable<any> {
    const userDocRef = this.userService.getUserDocRef();
    if (!userDocRef) return of(null);

    return from(updateDoc(userDocRef, { dietNutrition })).pipe(
      map(() => dietNutrition),
      catchError((error) => {
        console.error('Error updating diet nutrition:', error);
        return of(null);
      }),
    );
  }

  // Set Financial Planning
  setFinancialPlanning(financialPlanning: any): Observable<any> {
    const userDocRef = this.userService.getUserDocRef();
    if (!userDocRef) return of(null);

    return from(
      setDoc(userDocRef, { financialPlanning }, { merge: true }),
    ).pipe(
      map(() => financialPlanning),
      catchError((error) => {
        console.error('Error setting financial planning:', error);
        return of(null);
      }),
    );
  }

  // Update Financial Planning
  updateFinancialPlanning(financialPlanning: any): Observable<any> {
    const userDocRef = this.userService.getUserDocRef();
    if (!userDocRef) return of(null);

    return from(updateDoc(userDocRef, { financialPlanning })).pipe(
      map(() => financialPlanning),
      catchError((error) => {
        console.error('Error updating financial planning:', error);
        return of(null);
      }),
    );
  }

  // Set Lifestyle Health
  setLifestyleHealth(lifestyleHealth: any): Observable<any> {
    const userDocRef = this.userService.getUserDocRef();
    if (!userDocRef) return of(null);

    return from(setDoc(userDocRef, { lifestyleHealth }, { merge: true })).pipe(
      map(() => lifestyleHealth),
      catchError((error) => {
        console.error('Error setting lifestyle health:', error);
        return of(null);
      }),
    );
  }

  // Update Lifestyle Health
  updateLifestyleHealth(lifestyleHealth: any): Observable<any> {
    const userDocRef = this.userService.getUserDocRef();
    if (!userDocRef) return of(null);

    return from(updateDoc(userDocRef, { lifestyleHealth })).pipe(
      map(() => lifestyleHealth),
      catchError((error) => {
        console.error('Error updating lifestyle health:', error);
        return of(null);
      }),
    );
  }

  // Set More Info
  setMoreInfo(moreInfo: any): Observable<any> {
    const userDocRef = this.userService.getUserDocRef();
    if (!userDocRef) return of(null);

    return from(setDoc(userDocRef, { moreInfo }, { merge: true })).pipe(
      map(() => moreInfo),
      catchError((error) => {
        console.error('Error setting more info:', error);
        return of(null);
      }),
    );
  }

  // Update More Info
  updateMoreInfo(moreInfo: any): Observable<any> {
    const userDocRef = this.userService.getUserDocRef();
    if (!userDocRef) return of(null);

    return from(updateDoc(userDocRef, { moreInfo })).pipe(
      map(() => moreInfo),
      catchError((error) => {
        console.error('Error updating more info:', error);
        return of(null);
      }),
    );
  }

  // Set Resume
  setResume(resume: any): Observable<any> {
    const userDocRef = this.userService.getUserDocRef();
    if (!userDocRef) return of(null);

    return from(setDoc(userDocRef, { resume }, { merge: true })).pipe(
      map(() => resume),
      catchError((error) => {
        console.error('Error setting resume:', error);
        return of(null);
      }),
    );
  }

  // Update Resume
  updateResume(resume: any): Observable<any> {
    const userDocRef = this.userService.getUserDocRef();
    if (!userDocRef) return of(null);

    return from(updateDoc(userDocRef, { resume })).pipe(
      map(() => resume),
      catchError((error) => {
        console.error('Error updating resume:', error);
        return of(null);
      }),
    );
  }

  // Set Work Skills
  setWorkSkills(workSkills: any): Observable<any> {
    const userDocRef = this.userService.getUserDocRef();
    if (!userDocRef) return of(null);

    return from(setDoc(userDocRef, { workSkills }, { merge: true })).pipe(
      map(() => workSkills),
      catchError((error) => {
        console.error('Error setting work skills:', error);
        return of(null);
      }),
    );
  }

  // Update Work Skills
  updateWorkSkills(workSkills: any): Observable<any> {
    const userDocRef = this.userService.getUserDocRef();
    if (!userDocRef) return of(null);

    return from(updateDoc(userDocRef, { workSkills })).pipe(
      map(() => workSkills),
      catchError((error) => {
        console.error('Error updating work skills:', error);
        return of(null);
      }),
    );
  }
}
