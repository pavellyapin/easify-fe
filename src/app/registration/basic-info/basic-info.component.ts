/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { CustomDayStepActionsComponent } from '@components/step-actions/step-actions.component';
import { Store } from '@ngrx/store';
import * as UserActions from '@store/user/user.action'; // Import actions
import * as UserSelectors from '@store/user/user.selector';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-basic-info',
  templateUrl: './basic-info.component.html',
  styleUrl: './basic-info.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    NgxMatTimepickerModule,
    CustomDayStepActionsComponent,
  ],
})
export class BasicInfoComponent implements OnInit, OnDestroy {
  basicInfoForm!: FormGroup;
  basicInfo: any; // Local variable to store the basicInfo
  subscriptions: Subscription[] = []; // Array to track subscriptions

  constructor(private store: Store) {}

  ngOnInit(): void {
    // Initialize the form
    this.basicInfoForm = new FormGroup({
      morningGoals: new FormControl(''),
      eveningGoals: new FormControl(''),
      wakeUpTime: new FormControl('6:00 AM'),
      sleepTime: new FormControl('9:00 PM'),
    });

    // Subscribe to basicInfo from the store and set the local variable
    const basicInfoSubscription = this.store
      .select(UserSelectors.selectBasicInfo)
      .subscribe((basicInfo) => {
        if (basicInfo) {
          this.basicInfo = basicInfo;
          this.basicInfoForm.patchValue(basicInfo);
        }
      });

    // Add the subscription to the subscriptions array
    this.subscriptions.push(basicInfoSubscription);
  }

  // Handle form submission
  onSubmit(): void {
    if (this.basicInfoForm.valid) {
      const basicInfo = this.basicInfoForm.value;
      // Dispatch the action to set basic info in the store
      this.store.dispatch(UserActions.setBasicInfo({ basicInfo }));
    }
  }

  // Reset the form with default or current values
  resetForm(): void {
    this.basicInfoForm.reset({
      morningGoals: '',
      eveningGoals: '',
      wakeUpTime: this.basicInfo?.wakeUpTime || '6:00 AM',
      sleepTime: this.basicInfo?.sleepTime || '9:00 PM',
    });
  }

  // Unsubscribe from all subscriptions on component destroy
  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }
}
