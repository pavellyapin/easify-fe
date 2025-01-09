/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-extraneous-class */

import { Injectable } from '@angular/core';

// src/app/utils/time.utils.ts
@Injectable({
  providedIn: 'root',
})
export class TimeUtilsAndMore {
  /**
   * Checks if the current time is within the given time range.
   * @param timeRange The time range in the format "HH:MM AM/PM - HH:MM AM/PM"
   * @returns {boolean} True if the current time is within the time range, otherwise false.
   */
  isCurrentTime(timeRange: string): boolean {
    const [start, end] = timeRange
      .split('-')
      .map((time) => this.parseTime(time));
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    return currentTime >= start! && currentTime <= end!;
  }

  /**
   * Parses a time string (e.g., "12:30 PM") into the number of minutes since midnight.
   * @param time The time string to parse.
   * @returns {number} The number of minutes since midnight.
   */
  parseTime(time: string): number {
    const [timePart, period] = time.trim().split(' ');
    let [hours, minutes] = timePart!.split(':').map(Number);

    if (period!.toLowerCase() === 'pm' && hours !== 12) {
      hours! += 12;
    } else if (period!.toLowerCase() === 'am' && hours === 12) {
      hours = 0;
    }

    return hours! * 60 + minutes!;
  }

  sortByCreatedDate(a: any, b: any) {
    return a.createdDate < b.createdDate ? 1 : -1;
  }
  /**
   * Converts a date string into a relative time (e.g., "1 min ago", "yesterday").
   * @param dateString The date string in the format "October 15, 2024 at 10:10:34 AM UTC-4".
   * @returns {string} A human-readable relative time string.
   */
  getRelativeTime(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // Time constants
    const minute = 60;
    const hour = 60 * minute;
    const day = 24 * hour;
    const month = 30 * day; // Approximation for a month

    if (diffInSeconds < minute) {
      return `${diffInSeconds} second${diffInSeconds === 1 ? '' : 's'} ago`;
    } else if (diffInSeconds < hour) {
      const minutes = Math.floor(diffInSeconds / minute);
      return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    } else if (diffInSeconds < day) {
      const hours = Math.floor(diffInSeconds / hour);
      return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    } else if (diffInSeconds < 2 * day) {
      return `yesterday`;
    } else if (diffInSeconds < month) {
      const days = Math.floor(diffInSeconds / day);
      return `${days} day${days === 1 ? '' : 's'} ago`;
    } else {
      const months = Math.floor(diffInSeconds / month);
      return `${months} month${months === 1 ? '' : 's'} ago`;
    }
  }

  jsonToHtml(json: any): string {
    if (
      typeof json === 'string' ||
      typeof json === 'number' ||
      typeof json === 'boolean'
    ) {
      return `<span>${json}</span>`;
    }

    if (Array.isArray(json)) {
      return `
        <ul>
          ${json.map((item) => `<li>${this.jsonToHtml(item)}</li>`).join('')}
        </ul>
      `;
    }

    if (typeof json === 'object' && json !== null) {
      return `
        <div>
          ${Object.entries(json)
            .map(
              ([key, value]) => `
                <div>
                  <h6>${this.formatKey(key)}</h6>
                  <p>${this.jsonToHtml(value)}</p>
                </div>
              `,
            )
            .join('')}
        </div>
      `;
    }

    return '';
  }

  /**
   * Formats a JSON key into a more readable format.
   * For example, "conflictAndRivalry" becomes "Conflict and Rivalry".
   */
  formatKey(key: string): string {
    return key
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/^\w/, (c) => c.toUpperCase());
  }
}
