/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class EasifyService {
  private baseUrl: string = environment.apiUrl;

  constructor(private http: HttpClient) {}

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
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.post<any>(
      `${this.baseUrl}/getDaily`,
      { conversation },
      { headers },
    );
  }
}
