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
export class TimeUtils {
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
}
