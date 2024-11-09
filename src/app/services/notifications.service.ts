/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import {
  Firestore,
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  constructor(
    private firestore: Firestore,
    private auth: Auth,
  ) {}

  // Method to fetch all notifications sorted by createdAt
  async getAllNotifications(): Promise<any[]> {
    try {
      const userId = this.auth.currentUser?.uid;

      if (!userId) {
        throw new Error('User not authenticated');
      }

      const notificationsRef = collection(
        this.firestore,
        `users/${userId}/notifications`,
      );

      // Query to get all notifications sorted by createdAt
      const notificationsQuery = query(
        notificationsRef,
        orderBy('createdAt', 'desc'),
      );

      const querySnapshot = await getDocs(notificationsQuery);

      const notifications = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return notifications;
    } catch (error: any) {
      console.error('Error getting notifications', error);
      return [];
    }
  }

  // Method to get the count of unread notifications (where isRead is false)
  async getUnreadNotificationCount(): Promise<number> {
    try {
      const userId = this.auth.currentUser?.uid;

      if (!userId) {
        throw new Error('User not authenticated');
      }

      const notificationsRef = collection(
        this.firestore,
        `users/${userId}/notifications`,
      );

      // Query to count unread notifications (where isRead is false)
      const unreadNotificationsQuery = query(
        notificationsRef,
        where('isRead', '==', false),
      );

      const querySnapshot = await getDocs(unreadNotificationsQuery);
      const unreadCount = querySnapshot.size; // Gets the count of unread notifications
      return unreadCount;
    } catch (error: any) {
      console.error('Error getting unread notifications count', error);
      return 0;
    }
  }
}
