/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { setDashboardLoading } from '@store/loader/loading.actions';
import {
  loadTomorrowSuccess,
  refreshScheduleFailure,
  refreshScheduleSuccess,
} from '@store/schedule/schedule.actions';
import * as StartedGrowthActions from '@store/started-growth/started-growth.actions';
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
    private store: Store,
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

  // Function to expand specific parts of a course, workout, or recipe
  expandContent(request: any): Observable<any> {
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
          `${this.baseUrl}/easifyAi`,
          { easifyRequest: request },
          {
            headers,
          },
        );
      }),
      catchError((error) => {
        console.error('Error occurred while expanding content:', error);
        this.router.navigate(['dashboard', 'error']);
        return throwError(() => new Error('Error expanding content'));
      }),
    );
  }

  getDaily(request: any, action: string): void {
    const webSocketUrl = environment.websocketUrl; // Ensure this is defined in your environment file
    const token =
      this.auth.currentUser?.getIdToken() ??
      Promise.reject('User not authenticated');

    token
      .then((authToken) => {
        const socket = new WebSocket(webSocketUrl);

        // Handle WebSocket connection open
        socket.onopen = () => {
          console.log('WebSocket connection opened.');
          const message = {
            action: action,
            token: authToken,
            request,
          };
          socket.send(JSON.stringify(message));
        };

        // Handle incoming messages from the WebSocket
        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.status === 'success') {
              if (request.forTomorrow) {
                this.store.dispatch(
                  loadTomorrowSuccess({
                    tomorrowData: data.schedule,
                  }),
                );
              } else {
                this.store.dispatch(
                  refreshScheduleSuccess({
                    scheduleData: data.schedule,
                  }),
                );
              }
            } else {
              console.error('Error from WebSocket:', data.message);
              this.store.dispatch(
                refreshScheduleFailure({
                  error: data.message,
                }),
              );
            }
          } catch (error) {
            console.error('Error processing WebSocket message:', error);
            this.store.dispatch(
              refreshScheduleFailure({
                error: error,
              }),
            );
          } finally {
            socket.close();
          }
        };

        // Handle WebSocket errors
        socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.store.dispatch(
            refreshScheduleFailure({
              error: 'WebSocket connection error',
            }),
          );
          socket.close();
        };
      })
      .catch((error) => {
        console.error('Error obtaining authentication token:', error);
        this.store.dispatch(refreshScheduleFailure({ error }));
      });
  }

  scanResume(fileName: string): void {
    const webSocketUrl = environment.websocketUrl; // Ensure this is defined in your environment file
    const token =
      this.auth.currentUser?.getIdToken() ??
      Promise.reject('User not authenticated');

    token
      .then((authToken) => {
        const socket = new WebSocket(webSocketUrl);

        // Handle WebSocket connection open
        socket.onopen = () => {
          console.log('WebSocket connection opened.');
          const message = {
            action: 'scanResume',
            token: authToken,
            fileName,
          };
          socket.send(JSON.stringify(message));
        };

        // Handle incoming messages from the WebSocket
        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.status === 'success') {
              // Dispatch the action to save miniScan data to the state
              this.store.dispatch(
                StartedGrowthActions.loadMiniResumeSuccess({
                  miniResume: data.analysisResultObj,
                }),
              );
              this.store.dispatch(setDashboardLoading(false));
            } else {
              console.error('Error from WebSocket:', data.message);
              this.store.dispatch(
                StartedGrowthActions.loadMiniResumeFailure({
                  error: data.message,
                }),
              );
              this.store.dispatch(setDashboardLoading(false));
            }
          } catch (error) {
            console.error('Error processing WebSocket message:', error);
            this.store.dispatch(
              StartedGrowthActions.loadMiniResumeFailure({
                error: error,
              }),
            );
            this.store.dispatch(setDashboardLoading(false));
          } finally {
            socket.close();
            this.store.dispatch(setDashboardLoading(false));
          }
        };

        // Handle WebSocket errors
        socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.store.dispatch(
            StartedGrowthActions.loadMiniResumeFailure({
              error: 'WebSocket connection error',
            }),
          );
          this.store.dispatch(setDashboardLoading(false));
          socket.close();
        };
      })
      .catch((error) => {
        console.error('Error obtaining authentication token:', error);
        this.store.dispatch(
          StartedGrowthActions.loadMiniResumeFailure({ error }),
        );
        this.store.dispatch(setDashboardLoading(false));
      });
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
