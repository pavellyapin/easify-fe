/* eslint-disable @angular-eslint/component-max-inline-declarations */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { selectSchedule } from '../../store/schedule/schedule.selectors';

@Component({
  selector: 'app-daily-look',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  templateUrl: './daily-look.component.html',
  styleUrl: './daily-look.component.scss',
  animations: [
    trigger('slideAnimation', [
      state('in', style({ transform: 'translateY(0)' })),
      transition(':enter', [
        style({ transform: 'translateY(10%)' }),
        animate('300ms ease-in'),
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ transform: 'translateY(-10%)' })),
      ]),
    ]),
    trigger('fadeAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('300ms ease-out', style({ opacity: 0 }))]),
    ]),
  ],
})
export class DailyLookComponent implements OnInit, OnDestroy {
  dailySchedule$!: Observable<any | null>;
  visibleSchedule: any[] = [];
  currentIndex = 0;
  private scheduleSubscription: Subscription = new Subscription();

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.dailySchedule$ = this.store.select(selectSchedule);
    this.scheduleSubscription = this.dailySchedule$.subscribe(
      (dailySchedule) => {
        const schedule = dailySchedule.schedule.schedule.schedule;
        const currentIndex = schedule.findIndex((item: any) =>
          this.isCurrentTime(item.time_range),
        );
        this.currentIndex = currentIndex === -1 ? 0 : currentIndex;
        this.updateVisibleSchedule(schedule);
      },
    );
  }

  ngOnDestroy(): void {
    this.scheduleSubscription.unsubscribe();
  }

  previous() {
    if (this.currentIndex > 0) {
      this.currentIndex -= 1;
      this.dailySchedule$.subscribe((dailySchedule) => {
        this.updateVisibleSchedule(dailySchedule.schedule.schedule.schedule);
      });
    }
  }

  next() {
    this.dailySchedule$.subscribe((dailySchedule) => {
      if (
        this.currentIndex + 3 <
        dailySchedule.schedule.schedule.schedule.length
      ) {
        this.currentIndex += 1;
        this.updateVisibleSchedule(dailySchedule.schedule.schedule.schedule);
      }
    });
  }

  private updateVisibleSchedule(schedule: any[]) {
    this.visibleSchedule = schedule.slice(
      this.currentIndex == 0 ? this.currentIndex : this.currentIndex - 1,
      this.currentIndex == 0 ? this.currentIndex + 5 : this.currentIndex + 4,
    );
  }

  isCurrentTime(timeRange: string): boolean {
    const [start, end] = timeRange
      .split('-')
      .map((time) => this.parseTime(time));
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    return currentTime >= start! && currentTime <= end!;
  }

  private parseTime(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours! * 60 + minutes!;
  }
  trackByFn(index: number): number {
    return index;
  }
}
