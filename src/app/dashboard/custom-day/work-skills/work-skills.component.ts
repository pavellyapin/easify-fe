/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable rxjs/no-nested-subscribe */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AlertCardComponent } from '@components/alert-card/alert-card.component';
import { CourseCategoryAutocompleteComponent } from '@dashboard/courses/course-category-autocomplete/course-category-autocomplete.component';
import { Store } from '@ngrx/store';
import { CapitalizePipe } from '@services/capitalize.pipe';
import * as ScheduleActions from '@store/schedule/schedule.actions';
import * as ScheduleSelectors from '@store/schedule/schedule.selectors';
import * as UserSelectors from '@store/user/user.selector';
import { combineLatest, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { CustomDayStepActionsComponent } from '../../../components/step-actions/step-actions.component';

@Component({
  selector: 'app-custom-day-work-skills',
  standalone: true,
  imports: [
    CommonModule,
    MatInputModule,
    MatChipsModule,
    MatIconModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    FormsModule,
    AlertCardComponent,
    CapitalizePipe,
    CourseCategoryAutocompleteComponent,
    CustomDayStepActionsComponent,
  ],
  templateUrl: './work-skills.component.html',
  styleUrl: './work-skills.component.scss',
})
export class CustomDayWorkSkillsComponent implements OnInit, OnDestroy {
  workSkillsForm!: FormGroup;
  addedCourseTags: string[] = [];
  subscriptions: Subscription[] = [];

  constructor(private store: Store) {}

  ngOnInit(): void {
    // Initialize the form group
    this.workSkillsForm = new FormGroup({
      additionalInfo: new FormControl(''),
    });
    // Combine customDayRequest$ and workSkills$ streams
    const combinedSub = combineLatest([
      this.store.select(ScheduleSelectors.selectCustomDayRequest).pipe(take(1)),
      this.store.select(UserSelectors.selectWorkSkills).pipe(take(1)),
    ]).subscribe(([customDayRequest, workSkills]) => {
      if (customDayRequest.workSkills) {
        const { additionalInfo, courseTags } = customDayRequest.workSkills;
        this.workSkillsForm.patchValue({
          additionalInfo: additionalInfo || '',
        });
        this.addedCourseTags = courseTags || [];
      } else if (workSkills) {
        this.workSkillsForm.patchValue({
          additionalInfo: workSkills.additionalInfo || '',
        });
        this.addedCourseTags = workSkills.courseTags || [];
      }
    });

    this.subscriptions.push(combinedSub);
  }

  // Unsubscribe from all subscriptions when component is destroyed
  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }

  // Handle course tag added from autocomplete
  onCourseTagAdded(courseTag: string): void {
    // Check if the course tag is valid and not already in the list
    if (courseTag && !this.addedCourseTags.includes(courseTag)) {
      this.addedCourseTags = [...this.addedCourseTags, courseTag];
    } else {
      console.log('Course tag already exists or is invalid.');
    }
  }

  // Remove course tag from addedCourseTags array
  removeCourseTag(courseTag: string): void {
    const index = this.addedCourseTags.indexOf(courseTag);
    if (index >= 0) {
      this.addedCourseTags = [
        ...this.addedCourseTags.slice(0, index),
        ...this.addedCourseTags.slice(index + 1),
      ];
    }
  }
  // Function to reset the form fields and course tags
  resetForm(): void {
    this.workSkillsForm.reset({
      additionalInfo: '',
    });
    this.addedCourseTags = [];
  }

  // Handle form submission
  onSubmit(): void {
    if (this.workSkillsForm.valid) {
      const workSkills = {
        ...this.workSkillsForm.value,
        courseTags: this.addedCourseTags,
      };
      // Dispatch the action to set work skills in the store
      this.store.dispatch(
        ScheduleActions.updateCustomDayWorkSkills({ workSkills }),
      );
    } else {
      console.log('Form is invalid');
    }
  }
}
