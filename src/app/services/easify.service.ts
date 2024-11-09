/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { catchError, from, Observable, switchMap, throwError } from 'rxjs';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class EasifyService {
  private baseUrl: string = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private auth: Auth,
    private router: Router,
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

  getDaily(type: string = 'basic'): Observable<any> {
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
          { dailyRequest: { type } }, // Pass `type` in the request payload
          { headers },
        );
      }),
      catchError((error) => {
        console.error('Error occurred:', error);
        this.router.navigate(['dashboard', 'error']);
        throw error;
      }),
    );
  }

  getCustomDay(request: any): Observable<any> {
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
          `${this.baseUrl}/getCustomDay`,
          { customRequest: request },
          {
            headers,
          },
        );
      }),
      catchError((error) => {
        console.error('Error occurred while fetching custom day:', error);
        this.router.navigate(['dashboard', 'error']);
        return throwError(() => new Error('Error fetching custom day'));
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

  // New function to generate avatar
  generateAvatar(): Observable<any> {
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
          `${this.baseUrl}/generateAvatar`,
          {},
          { headers },
        );
      }),
      catchError((error) => {
        console.error('Error occurred while generating avatar:', error);
        throw error;
      }),
    );
  }
}
