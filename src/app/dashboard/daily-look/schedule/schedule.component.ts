/* eslint-disable @typescript-eslint/no-floating-promises */
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
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ScheduleService } from '@services/schedule.service';
import { TimeUtilsAndMore } from '@services/time.utils';
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
import { ScheduleStatsComponent } from './schedule-stats/schedule-stats.component';

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
    ScheduleStatsComponent,
  ],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.scss',
})
export class ScheduleComponent implements OnInit, OnDestroy {
  // Grouped schedule details for today and tomorrow
  today = {
    id: '',
    date: '',
    day: '',
    model: '',
    type: '',
    schedule: [] as any[],
  };

  tomorrow = {
    id: '',
    date: '',
    day: '',
    model: '',
    type: '',
    schedule: [] as any[],
  };
  currentIndex = 0;
  debounceTimeout: any;
  private scheduleSubscription: Subscription = new Subscription();
  isLoading = false; // Local variable to store the loading state
  isScrolling = false;
  initTodayComplete = false;
  initTomorrowComplete = false;
  private subscription: Subscription = new Subscription();
  slideConfig = {
    slidesToShow: 1,
    slidesToScroll: 1,
    vertical: true,
    verticalSwiping: false,
    infinite: false,
  };
  @ViewChild('slickModal') slickModal!: SlickCarouselComponent;
  currentSchedule: any[] = [];
  currentScheduleId!: string;
  viewingTomorrow = false;
  isMobile = false;
  isTablet = false;

  constructor(
    private store: Store<ScheduleState>,
    private timeUtils: TimeUtilsAndMore,
    private scheduleService: ScheduleService,
    private router: Router,
    private breakpointObserver: BreakpointObserver,
  ) {}
  ngOnInit(): void {
    this.subscription.add(
      this.breakpointObserver
        .observe([Breakpoints.XSmall, Breakpoints.Small])
        .subscribe((result) => {
          const breakpoints = result.breakpoints;
          this.isMobile = breakpoints[Breakpoints.XSmall] ? true : false;
          this.isTablet = breakpoints[Breakpoints.Small] ? true : false;
        }),
    );
    this.subscription = this.store
      .select(selectIsScheduleLoading)
      .subscribe((loading) => {
        this.isLoading = loading;
      });
    // Subscribe to today's schedule
    this.subscription.add(
      this.store.select(selectSchedule).subscribe((scheduleState) => {
        this.today.schedule = scheduleState?.schedule || [];
        this.today.id = scheduleState?.id;
        this.today.date = scheduleState?.date || '';
        this.today.day = scheduleState?.day || '';
        this.today.model = scheduleState?.model || '';
        this.today.type = scheduleState?.type || '';
        if (!this.viewingTomorrow) {
          this.setScheduleInfo();
          if (!this.initTodayComplete) {
            this.currentIndex = 0;
            this.scrollToCurrentOrNextTimeSlot(this.today.schedule);
            this.initTodayComplete = true;
          }
        }
      }),
    );

    // Subscribe to tomorrow's schedule
    this.subscription.add(
      this.store.select(selectTomorrow).subscribe((scheduleState) => {
        if (scheduleState?.schedule && scheduleState.schedule.length > 0) {
          // If tomorrow's schedule is available
          this.tomorrow.schedule = scheduleState.schedule;
          this.tomorrow.id = scheduleState?.id;
          this.tomorrow.date = scheduleState.date;
          this.tomorrow.day = scheduleState.day;
          this.tomorrow.model = scheduleState.model;
          this.tomorrow.type = scheduleState.type;
        } else {
          // Fallback: Calculate tomorrow's date and day
          const todayDate = new Date();
          const tomorrowDate = new Date(todayDate);
          tomorrowDate.setDate(todayDate.getDate() + 1);

          this.tomorrow.date = tomorrowDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
          this.tomorrow.day = tomorrowDate.toLocaleDateString('en-US', {
            weekday: 'long',
          });
          this.tomorrow.schedule = []; // Empty schedule
        }

        this.isLoading = false;
        if (this.viewingTomorrow) {
          this.setScheduleInfo();
          if (!this.initTomorrowComplete) {
            setTimeout(() => {
              if (this.slickModal) {
                this.slickModal.slickGoTo(0);
                this.initTomorrowComplete = true;
              }
            }, 0);
          }
        }
      }),
    );
  }

  refreshSchedule(): void {
    this.router.navigate(['dashboard/refresh']); // Redirect to the specified route
  }

  private scrollToCurrentOrNextTimeSlot(schedule: any[]) {
    this.isScrolling = true;
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
        this.isScrolling = false;
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

  private setScheduleInfo() {
    if (this.viewingTomorrow) {
      this.currentScheduleId = this.tomorrow.id;
      this.currentSchedule = this.tomorrow.schedule;
    } else {
      this.currentScheduleId = this.today.id;
      this.currentSchedule = this.today.schedule;
    }
  }

  ngOnDestroy(): void {
    this.scheduleSubscription.unsubscribe();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  trackByIndex(index: number, _item: any): number {
    return index;
  }

  // Debounce method to prevent rapid consecutive clicks
  private debounce() {
    this.debounceTimeout = setTimeout(() => {
      this.debounceTimeout = null;
    }, 600); // Adjust the debounce time as needed
  }

  handleDaySelected(viewingTomorrow: boolean): void {
    this.isLoading = true;
    if (viewingTomorrow) {
      this.initTomorrowComplete = false;
    } else {
      this.initTodayComplete = false;
    }

    this.viewingTomorrow = viewingTomorrow;
    // Add additional logic if needed
    if (!this.viewingTomorrow) {
      // Switch to tomorrow's schedule
      this.currentIndex = 0;
      this.setScheduleInfo();
      setTimeout(() => {
        this.isLoading = false;
        this.scrollToCurrentOrNextTimeSlot(this.today.schedule);
      }, 300);
    } else {
      if (this.tomorrow.schedule.length === 0) {
        this.currentIndex = 0;
        this.scheduleService.loadTomorrowSchedule();
      } else {
        this.currentIndex = 0;
        this.setScheduleInfo();
        setTimeout(() => {
          this.isLoading = false;
          this.initTomorrowComplete = true;
        }, 300);
      }
    }
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
          this.setScheduleInfo();
          this.scrollToCurrentOrNextTimeSlot(this.today.schedule);
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
        if (this.tomorrow.schedule.length === 0) {
          this.isLoading = true;
          this.scheduleService.loadTomorrowSchedule();
        } else {
          if (!this.viewingTomorrow) {
            this.currentIndex = 0;
            this.viewingTomorrow = true;
            this.setScheduleInfo();
            this.slickModal.slickGoTo(0);
          }
        }
      }
    }
  }
}
