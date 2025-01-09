/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Store } from '@ngrx/store';
import * as UserActions from '@store/user/user.action'; // Import user actions
import * as UserSelectors from '@store/user/user.selector'; // Import user selectors
import { Observable, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { CustomDayStepActionsComponent } from '../../components/step-actions/step-actions.component';

@Component({
  selector: 'app-more-info',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    CustomDayStepActionsComponent,
  ],
  templateUrl: './more-info.component.html',
  styleUrl: './more-info.component.scss',
})
export class MoreInfoComponent implements OnInit, OnDestroy {
  moreInfoForm!: FormGroup; // Declare the form group
  moreInfo$: Observable<any>; // Observable for more info state
  private subscription: Subscription = new Subscription();

  constructor(private store: Store) {
    // Select the moreInfo state from the store
    this.moreInfo$ = this.store.select(UserSelectors.selectMoreInfo);
  }

  ngOnInit(): void {
    // Initialize the form with the 'additionalInfo' control
    this.moreInfoForm = new FormGroup({
      additionalInfo: new FormControl(''),
    });

    // Prepopulate form with existing moreInfo data if available in the store
    const sub = this.moreInfo$.pipe(take(1)).subscribe((moreInfo) => {
      if (moreInfo) {
        this.moreInfoForm.patchValue(moreInfo);
      }
    });

    this.subscription.add(sub); // Add subscription to the list
  }

  onSubmit(): void {
    if (this.moreInfoForm.valid) {
      const moreInfo = this.moreInfoForm.value;

      // Dispatch the setMoreInfo action with the form data
      this.store.dispatch(UserActions.setMoreInfo({ moreInfo }));
    } else {
      console.log('Form is invalid');
    }
  }

  resetForm(): void {
    // Reset the form to its initial state
    this.moreInfoForm.reset({
      additionalInfo: '', // Set default value for 'additionalInfo' field
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions to prevent memory leaks
    this.subscription.unsubscribe();
  }
}
