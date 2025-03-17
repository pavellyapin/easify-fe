/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@angular/core';
import { Analytics, logEvent } from '@angular/fire/analytics';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  constructor(
    private analytics: Analytics,
    private router: Router,
  ) {}

  init(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        logEvent(this.analytics, 'page_view', { page_path: event.url });
      });
  }

  trackEvent(eventName: string, eventParams?: any): void {
    console.log(`🔥 Logged event: ${eventName}`, eventParams);
  }
}
