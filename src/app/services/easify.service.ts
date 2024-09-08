/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { catchError, from, Observable, switchMap } from 'rxjs';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class EasifyService {
  private baseUrl: string = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private auth: Auth,
  ) {}

  getChatResponse(
    message: string,
    conversation: { role: string; content: string }[],
  ): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.post<any>(
      `${this.baseUrl}/getPrompt`,
      { message, conversation },
      { headers },
    );
  }

  getDaily(conversation: any[]): Observable<any> {
    return from(
      this.auth.currentUser?.getIdToken() ??
        Promise.reject('User not authenticated'),
    ).pipe(
      switchMap((token: string) => {
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: `${token}`,
        });

        return this.http.post<any>(
          `${this.baseUrl}/getDaily`,
          { conversation },
          { headers },
        );
      }),
      catchError((error) => {
        // Handle the error as needed
        console.error('Error occurred:', error);
        throw error;
      }),
    );
  }

  scanResume(fileName: any): Observable<any> {
    return from(
      this.auth.currentUser?.getIdToken() ??
        Promise.reject('User not authenticated'),
    ).pipe(
      switchMap((token: string) => {
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: `${token}`,
        });

        return this.http.post<any>(
          `${this.baseUrl}/scanResume`,
          { fileName },
          {
            headers,
          },
        );
      }),
      catchError((error) => {
        // Handle the error as needed
        console.error('Error occurred:', error);
        throw error;
      }),
    );
  }

  analyzeResume(fileName: any): Observable<any> {
    return from(
      this.auth.currentUser?.getIdToken() ??
        Promise.reject('User not authenticated'),
    ).pipe(
      switchMap((token: string) => {
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: `${token}`,
        });

        return this.http.post<any>(
          `${this.baseUrl}/analyzeResume`,
          { fileName },
          {
            headers,
          },
        );
      }),
      catchError((error) => {
        // Handle the error as needed
        console.error('Error occurred:', error);
        throw error;
      }),
    );
  }

  getRecipe(conversation: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.post<any>(`${this.baseUrl}/getRecipe`, conversation, {
      headers,
    });
  }

  sendShoppingList(shoppingList: string[], phoneNumber: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.post<any>(
      `${this.baseUrl}/sendShoppingList`,
      { phoneNumber, shoppingList },
      {
        headers,
      },
    );
  }
}
