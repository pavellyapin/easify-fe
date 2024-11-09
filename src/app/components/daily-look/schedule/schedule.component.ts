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
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import { ScheduleService } from '@services/schedule.service';
import { TimeUtils } from '@services/time.utils';
import { refreshSchedule } from '@store/schedule/schedule.actions';
import { ScheduleState } from '@store/schedule/schedule.reducer';
import {
  selectIsScheduleLoading,
  selectSchedule,
  selectTomorrow,
} from '@store/schedule/schedule.selectors';
import {
  SlickCarouselComponent,
  SlickCarouselModule,
} from 'ngx-slick-carousel';
import { Subscription } from 'rxjs';
import { TimeslotComponent } from '../timeslot/timeslot.component';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    SlickCarouselModule,
    TimeslotComponent,
    MatCardModule,
    MatButtonModule,
  ],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.scss',
})
export class ScheduleComponent implements OnInit, OnDestroy {
  // Today’s schedule properties
  date!: string;
  todayDate!: string;
  day!: string;
  todayDay!: string;
  model!: string;
  todayModel!: string;
  type!: string;
  todayType!: string;

  // Tomorrow’s schedule properties
  tomorrowDate!: string;
  tomorrowDay!: string;
  tomorrowModel!: string;
  tomorrowType!: string;
  currentIndex = 0;
  debounceTimeout: any;
  private scheduleSubscription: Subscription = new Subscription();
  isLoading = false; // Local variable to store the loading state
  private subscription: Subscription = new Subscription();
  slideConfig = {
    slidesToShow: 1,
    slidesToScroll: 1,
    vertical: true,
    verticalSwiping: false,
    infinite: false,
  };
  @ViewChild('slickModal') slickModal!: SlickCarouselComponent;
  todaySchedule: any[] = [];
  tomorrowSchedule: any[] = [];
  currentSchedule: any[] = [];
  viewingTomorrow = false;

  constructor(
    private store: Store<ScheduleState>,
    private timeUtils: TimeUtils,
    private scheduleService: ScheduleService,
  ) {}

  ngOnInit(): void {
    this.subscription = this.store
      .select(selectIsScheduleLoading)
      .subscribe((loading) => {
        this.isLoading = loading;
      });
    // Subscribe to today's schedule
    this.subscription.add(
      this.store.select(selectSchedule).subscribe((scheduleState) => {
        this.todaySchedule = scheduleState?.schedule || [];
        this.todayDate = scheduleState?.date || '';
        this.todayDay = scheduleState?.day || '';
        this.todayModel = scheduleState?.model || '';
        this.todayType = scheduleState?.type || '';
        if (!this.viewingTomorrow) {
          this.currentIndex = 0;
          this.currentSchedule = this.todaySchedule;
          this.setScheduleInfo();
          this.scrollToCurrentOrNextTimeSlot(this.todaySchedule);
        }
      }),
    );

    // Subscribe to tomorrow's schedule
    this.subscription.add(
      this.store.select(selectTomorrow).subscribe((scheduleState) => {
        this.tomorrowSchedule = scheduleState?.schedule || [];
        this.tomorrowDate = scheduleState?.date || '';
        this.tomorrowDay = scheduleState?.day || '';
        this.tomorrowModel = scheduleState?.model || '';
        this.tomorrowType = scheduleState?.type || '';
        this.isLoading = false;
        if (this.viewingTomorrow) {
          this.currentSchedule = this.tomorrowSchedule;
          this.setScheduleInfo();
          this.slickModal.slickGoTo(0);
        }
      }),
    );
  }

  refreshSchedule(): void {
    this.store.dispatch(refreshSchedule());
  }

  private scrollToCurrentOrNextTimeSlot(schedule: any[]) {
    this.currentIndex = schedule.findIndex((item) =>
      this.timeUtils.isCurrentTime(item.time_range),
    );
    if (this.currentIndex === -1) {
      this.currentIndex =
        this.getClosestTimeSlotIndex(schedule) !== -1
          ? this.getClosestTimeSlotIndex(schedule)
          : schedule.length - 1;
    }
    setTimeout(() => {
      if (this.slickModal) {
        this.slickModal.slickGoTo(this.currentIndex);
      }
    }, 0);
  }

  private getClosestTimeSlotIndex(schedule: any[]): number {
    const date = new Date();
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    // Convert hours to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // The hour '0' should be '12'

    // Add leading zero to minutes if needed
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    // Combine hours, minutes, and AM/PM
    const formattedTime = `${hours}:${formattedMinutes} ${ampm}`;

    const now = this.timeUtils.parseTime(formattedTime);
    return schedule.findIndex((item: any) => {
      const [start] = item.time_range
        .split(' - ')
        .map((time: string) => this.timeUtils.parseTime(time));
      return start > now;
    });
  }

  // Method to set schedule info based on `viewingTomorrow` flag
  private setScheduleInfo() {
    if (this.viewingTomorrow) {
      // Set tomorrow’s details
      this.date = this.tomorrowDate;
      this.day = this.tomorrowDay;
      this.model = this.tomorrowModel;
      this.type = this.tomorrowType;
    } else {
      // Set today’s details
      this.date = this.todayDate;
      this.day = this.todayDay;
      this.model = this.todayModel;
      this.type = this.todayType;
    }
  }

  ngOnDestroy(): void {
    this.scheduleSubscription.unsubscribe();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  // Debounce method to prevent rapid consecutive clicks
  private debounce() {
    this.debounceTimeout = setTimeout(() => {
      this.debounceTimeout = null;
    }, 600); // Adjust the debounce time as needed
  }

  goToPreviousSlide(): void {
    if (!this.debounceTimeout) {
      if (this.currentIndex > 0) {
        this.currentIndex--;
        this.slickModal.slickPrev();
        this.debounce();
      } else {
        if (this.viewingTomorrow) {
          // Switch to tomorrow's schedule
          this.viewingTomorrow = false;
          this.currentIndex = 0;
          this.currentSchedule = this.todaySchedule;
          this.setScheduleInfo();
          this.scrollToCurrentOrNextTimeSlot(this.todaySchedule);
        }
      }
    }
  }

  goToNextSlide(): void {
    if (!this.debounceTimeout) {
      if (this.currentIndex < this.currentSchedule.length - 1) {
        this.currentIndex++;
        this.slickModal.slickNext();
        this.debounce();
      } else {
        // Switch to tomorrow's schedule
        if (this.tomorrowSchedule.length === 0) {
          this.isLoading = true;
          this.scheduleService.loadTomorrowSchedule();
        } else {
          if (!this.viewingTomorrow) {
            this.currentIndex = 0;
            this.viewingTomorrow = true;
            this.currentSchedule = this.tomorrowSchedule;
            this.setScheduleInfo();
            this.slickModal.slickGoTo(0);
          }
        }
      }
    }
  }
}
