/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @angular-eslint/component-max-inline-declarations */
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Store } from '@ngrx/store';
import {
  SlickCarouselComponent,
  SlickCarouselModule,
} from 'ngx-slick-carousel';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { TimeUtils } from '../../services/time.utils';
import { selectSchedule } from '../../store/schedule/schedule.selectors';
import { MealPrepModelComponent } from './meal-prep-model/meal-prep-model.component';
import { TimeslotComponent } from './timeslot/timeslot.component';

@Component({
  selector: 'app-daily-look',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MealPrepModelComponent,
    MatDialogModule,
    SlickCarouselModule,
    TimeslotComponent,
  ],
  templateUrl: './daily-look.component.html',
  styleUrl: './daily-look.component.scss',
})
export class DailyLookComponent implements OnInit, OnDestroy {
  date!: string;
  day!: string;
  dailySchedule$!: Observable<any[]>;
  currentIndex = 0;
  private scheduleSubscription: Subscription = new Subscription();
  slideConfig = {
    slidesToShow: 1,
    slidesToScroll: 1,
    vertical: true,
    verticalSwiping: true,
    infinite: false,
  };

  @ViewChild('slickModal') slickModal!: SlickCarouselComponent;
  private schedule: any[] = [];

  constructor(
    private store: Store,
    private timeUtils: TimeUtils,
  ) {}

  ngOnInit(): void {
    this.dailySchedule$ = this.store.select(selectSchedule).pipe(
      map((scheduleState) => {
        this.date = scheduleState?.schedule?.date || '';
        this.day = scheduleState?.schedule?.day || '';
        const schedule = scheduleState?.schedule?.schedule || [];

        // Find the index of the current time slot
        this.currentIndex = schedule.findIndex((item: any) =>
          this.timeUtils.isCurrentTime(item.time_range),
        );

        // If no current time range is found, find the next closest time slot
        if (this.currentIndex === -1) {
          const now = this.timeUtils.parseTime(
            `${new Date().getHours()}:${new Date().getMinutes()}`,
          );

          this.currentIndex = schedule.findIndex((item: any) => {
            const [start] = item.time_range
              .split(' - ')
              .map((time: string) => this.timeUtils.parseTime(time));
            return start > now;
          });

          // If still not found, default to the first item
          if (this.currentIndex === -1) {
            this.currentIndex = 0;
          }
        }
        this.schedule = schedule;

        // Scroll to the current time item
        setTimeout(() => {
          if (this.slickModal) {
            this.slickModal.slickGoTo(this.currentIndex);
          }
        }, 0);

        return schedule;
      }),
    );

    this.scheduleSubscription = this.dailySchedule$.subscribe();
  }

  ngOnDestroy(): void {
    this.scheduleSubscription.unsubscribe();
  }

  goToPreviousSlide(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.slickModal.slickPrev();
    }
  }

  goToNextSlide(): void {
    if (this.currentIndex < this.schedule.length - 1) {
      this.currentIndex++;
      this.slickModal.slickNext();
    }
  }
}
