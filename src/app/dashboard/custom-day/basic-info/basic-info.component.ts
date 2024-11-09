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
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AlertCardComponent } from '@components/alert-card/alert-card.component';
import { Store } from '@ngrx/store';
import * as ScheduleActions from '@store/schedule/schedule.actions'; // Import actions
import * as ScheduleSelectors from '@store/schedule/schedule.selectors'; // Select from schedule
import * as UserSelectors from '@store/user/user.selector'; // Select from user store
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { combineLatest, Subscription } from 'rxjs';
import { mergeMap, take } from 'rxjs/operators';
import { CustomDayStepActionsComponent } from '../step-actions/step-actions.component';

@Component({
  selector: 'app-custom-day-basic-info',
  templateUrl: './basic-info.component.html',
  styleUrl: './basic-info.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatRadioModule,
    MatInputModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    NgxMatTimepickerModule,
    AlertCardComponent,
    MatSlideToggleModule,
    CustomDayStepActionsComponent,
  ],
})
export class CustomDayBasicInfoComponent implements OnInit, OnDestroy {
  basicInfoForm!: FormGroup;
  basicInfo: any; // Local variable to store selected basic info
  subscriptions: Subscription[] = []; // Array to hold subscriptions

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.basicInfoForm = new FormGroup({
      wakeUpTime: new FormControl(''),
      sleepTime: new FormControl(''),
      forTomorrow: new FormControl(false),
      details: new FormControl(''),
    });

    // Combine customDayRequest and basicInfo observables
    const combinedSub = combineLatest([
      this.store.select(ScheduleSelectors.selectCustomDayRequest).pipe(take(1)),
      this.store.select(UserSelectors.selectBasicInfo).pipe(take(1)),
    ])
      .pipe(
        mergeMap(([customDayRequest, basicInfo]) => {
          // Check customDayRequest for existing basicInfo and populate the form
          this.basicInfo = basicInfo;
          if (customDayRequest?.basicInfo) {
            const { wakeUpTime, sleepTime, details } =
              customDayRequest.basicInfo;
            this.basicInfoForm.patchValue({
              wakeUpTime: wakeUpTime || '6:00 AM',
              sleepTime: sleepTime || '9:00 PM',
              details: details || '',
            });
          } else if (basicInfo) {
            // If no customDayRequest info, use basicInfo from user data
            this.basicInfo = basicInfo;
            this.basicInfoForm.patchValue({
              wakeUpTime: basicInfo.wakeUpTime || '6:00 AM',
              sleepTime: basicInfo.sleepTime || '9:00 PM',
            });
          }
          return [];
        }),
      )
      .subscribe();

    this.subscriptions.push(combinedSub);
  }

  get forTomorrowControl() {
    return this.basicInfoForm.get('forTomorrow');
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
    this.basicInfoForm.reset({
      wakeUpTime: this.basicInfo.wakeUpTime || '6:00 AM',
      sleepTime: this.basicInfo.sleepTime || '9:00 PM',
      forTomorrow: false, // Default value as defined in ngOnInit
      details: '',
    });
  }

  // Handle form submission
  onSubmit(): void {
    if (this.basicInfoForm.valid) {
      const basicInfo = this.basicInfoForm.value;
      // Dispatch the action to set basic info in the store
      this.store.dispatch(
        ScheduleActions.updateCustomDayBasicInfo({ basicInfo }),
      );
    }
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }
}
