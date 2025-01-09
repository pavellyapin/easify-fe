/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ActivatedRoute } from '@angular/router';
import { CustomDayStepActionsComponent } from '@components/step-actions/step-actions.component';
import { Store } from '@ngrx/store';
import { CapitalizePipe } from '@services/capitalize.pipe';
import * as ScheduleActions from '@store/schedule/schedule.actions';
import * as UserSelectors from '@store/user/user.selector'; // Select from user store
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { combineLatest, Subscription } from 'rxjs';
import { mergeMap, take } from 'rxjs/operators';

@Component({
  selector: 'app-refresh-day',
  templateUrl: './refresh-day.component.html',
  styleUrl: './refresh-day.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    NgxMatTimepickerModule,
    MatSlideToggleModule,
    CustomDayStepActionsComponent,
    CapitalizePipe,
  ],
})
export class RefreshDayComponent implements OnInit, OnDestroy {
  refreshDayForm!: FormGroup;
  basicInfo: any; // Local variable to store selected basic info
  subscriptions: Subscription[] = []; // Array to hold subscriptions
  types: string[] = ['firstHalf', 'secondHalf', 'full', 'expanded', 'smart'];

  constructor(
    private store: Store,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    // Retrieve the query parameter
    this.route.queryParams.subscribe((params) => {
      this.refreshDayForm = new FormGroup({
        wakeUpTime: new FormControl(''),
        type: new FormControl('full'),
        sleepTime: new FormControl(''),
        forTomorrow: new FormControl(params['forTomorrow'] === 'true' || false),
        moreInfo: new FormControl(''),
      });
    });

    // Combine customDayRequest and basicInfo observables
    const combinedSub = combineLatest([
      this.store.select(UserSelectors.selectBasicInfo).pipe(take(1)),
    ])
      .pipe(
        mergeMap(([basicInfo]) => {
          // If no customDayRequest info, use basicInfo from user data
          this.basicInfo = basicInfo;
          this.refreshDayForm.patchValue({
            wakeUpTime: this.basicInfo.wakeUpTime || '6:00 AM',
            sleepTime: this.basicInfo.sleepTime || '9:00 PM',
          });
          return [];
        }),
      )
      .subscribe();

    this.subscriptions.push(combinedSub);
  }

  get forTomorrowControl() {
    return this.refreshDayForm.get('forTomorrow');
  }

  getDate(isToday: boolean): string {
    const date = new Date();
    if (!isToday) {
      date.setDate(date.getDate() + 1); // Move to tomorrow's date
    }
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }

  resetForm(): void {
    this.refreshDayForm.reset({
      wakeUpTime: this.basicInfo.wakeUpTime || '6:00 AM',
      sleepTime: this.basicInfo.sleepTime || '9:00 PM',
      forTomorrow: false, // Default value as defined in ngOnInit
      moreInfo: '',
      type: 'full',
    });
  }

  // Handle form submission
  onSubmit(): void {
    if (this.refreshDayForm.valid) {
      const request = this.refreshDayForm.value;
      // Dispatch the action to set basic info in the store
      this.store.dispatch(ScheduleActions.refreshSchedule({ request }));
    }
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }
}
