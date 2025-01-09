/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NotificationsService } from '@services/notifications.service';
import { TimeUtilsAndMore } from '@services/time.utils';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, MatListModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss',
})
export class NotificationsComponent implements OnInit {
  public notifications: any[] = []; // Array to hold notifications
  public isLoading = true; // Flag to show loading state

  constructor(
    private notificationsService: NotificationsService,
    private timeUtils: TimeUtilsAndMore,
  ) {}

  ngOnInit(): void {
    this.loadNotifications(); // Fetch notifications when component is initialized
  }

  // Method to load notifications
  async loadNotifications(): Promise<void> {
    try {
      const rawNotifications =
        await this.notificationsService.getAllNotifications();

      // Convert Firestore timestamps to JS Date objects and calculate relative time
      this.notifications = rawNotifications.map((notification) => {
        const createdAtDate = this.convertFirestoreTimestampToDate(
          notification.createdAt,
        );
        notification.relativeTime =
          this.timeUtils.getRelativeTime(createdAtDate);
        return notification;
      });

      this.isLoading = false; // Turn off loading after fetching data
    } catch (error) {
      console.error('Error loading notifications:', error);
      this.isLoading = false;
    }
  }

  // Convert Firestore timestamp to JavaScript Date object
  convertFirestoreTimestampToDate(timestamp: any): Date {
    if (timestamp?.seconds) {
      return new Date(
        timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000,
      );
    }
    return new Date(); // Default to current date if invalid timestamp
  }
}
