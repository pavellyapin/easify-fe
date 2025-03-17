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
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CustomDayStepActionsComponent } from '@components/step-actions/step-actions.component';
import { CourseCategoryAutocompleteComponent } from '@dashboard/courses/course-category-autocomplete/course-category-autocomplete.component';
import { LoadingChipsComponent } from '@dashboard/daily-look/timeslot/loading-chips/loading-chips.component';
import { IndustriesAutocompleteComponent } from '@dashboard/personal-growth/industries-autocomplete/industries-autocomplete.component';
import { Store } from '@ngrx/store';
import { CapitalizePipe } from '@services/capitalize.pipe';
import { CoursesService } from '@services/courses.service';
import { GrowthService } from '@services/growth.service';
import * as UserActions from '@store/user/user.action'; // Import user actions
import * as UserSelectors from '@store/user/user.selector';
import { Subscription, take } from 'rxjs';

@Component({
  selector: 'app-work-skills',
  standalone: true,
  imports: [
    IndustriesAutocompleteComponent,
    CommonModule,
    MatInputModule,
    MatChipsModule,
    MatIconModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatSelectModule,
    CourseCategoryAutocompleteComponent,
    CapitalizePipe,
    CustomDayStepActionsComponent,
    LoadingChipsComponent,
  ],
  templateUrl: './work-skills.component.html',
  styleUrl: './work-skills.component.scss',
})
export class WorkSkillsComponent implements OnInit, OnDestroy {
  workSkillsForm!: FormGroup;
  addedIndustries: string[] = [];
  addedCourseTags: string[] = [];
  showHybridOptions = false;
  workSkills$: Subscription = new Subscription();
  subscriptions: Subscription[] = [];
  chipsLoading = false;

  constructor(
    private industryService: GrowthService,
    private coursesService: CoursesService,
    private store: Store,
  ) {}

  ngOnInit(): void {
    // Initialize the form group
    this.workSkillsForm = new FormGroup({
      occupation: new FormControl(''),
      workStatus: new FormControl(''),
      hybridStatus: new FormControl(''),
    });

    this.chipsLoading = true;

    // Subscribe to workSkills state and prepopulate the form
    const workSkillsSub = this.store
      .select(UserSelectors.selectWorkSkills)
      .pipe(take(1))
      .subscribe((workSkills) => {
        if (workSkills) {
          this.workSkillsForm.patchValue(workSkills);
          this.addedIndustries = workSkills.industries || this.addedIndustries;
          this.addedCourseTags = workSkills.courseTags || this.addedCourseTags;
        }
        setTimeout(() => {
          this.chipsLoading = false;
        }, 500);
      });

    this.subscriptions.push(workSkillsSub);

    const industriesSub = this.industryService
      .getAllIndustryTags()
      .subscribe((tags) => {
        if (this.addedIndustries.length === 0) {
          this.addedIndustries = this.getRandomTags(tags, 3);
        }
      });
    this.subscriptions.push(industriesSub);

    const coursesSub = this.coursesService
      .getAllCourseCategories()
      .subscribe((tags) => {
        if (this.addedCourseTags.length === 0) {
          this.addedCourseTags = this.getRandomTags(tags, 3);
        }
      });
    this.subscriptions.push(coursesSub);
  }

  // Unsubscribe from all subscriptions when component is destroyed
  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }

  resetForm(): void {
    this.workSkillsForm.reset({
      occupation: '',
      workStatus: '',
      hybridStatus: '',
    });

    // Clear the added industries and course tags
    this.addedIndustries = [];
    this.addedCourseTags = [];
  }

  // Handle industry added from autocomplete
  onIndustryAdded(industry: string): void {
    // Check if the industry is already in the list to avoid duplicates
    if (industry && !this.addedIndustries.includes(industry)) {
      // Add the new industry to the array
      this.addedIndustries = [...this.addedIndustries, industry];
    } else {
      console.log('Industry already exists or is invalid.');
    }
  }

  // Remove industry from addedIndustries array
  removeIndustry(industry: string): void {
    const index = this.addedIndustries.indexOf(industry);

    if (index >= 0) {
      if (this.addedIndustries.length === 1) {
        // Handle case where the last item is being removed
        console.log('The last industry is being removed.');
      }

      // Safely remove the item from the array
      this.addedIndustries = [
        ...this.addedIndustries.slice(0, index),
        ...this.addedIndustries.slice(index + 1),
      ];
    }
  }

  // Handle course tag added from autocomplete
  onCourseTagAdded(courseTag: any): void {
    // Check if the course tag is valid (i.e., non-empty) and not already in the list
    if (courseTag && !this.addedCourseTags.includes(courseTag)) {
      // Add the new course tag to the array using immutability
      this.addedCourseTags = [...this.addedCourseTags, courseTag];
    } else {
      console.log('Course tag already exists or is invalid.');
    }
  }

  // Remove course tag from addedCourseTags array
  removeCourseTag(courseTag: string): void {
    const index = this.addedCourseTags.indexOf(courseTag);

    if (index >= 0) {
      if (this.addedCourseTags.length === 1) {
        // Handle case where the last item is being removed
        console.log('The last course tag is being removed.');
      }

      // Safely remove the item from the array
      this.addedCourseTags = [
        ...this.addedCourseTags.slice(0, index),
        ...this.addedCourseTags.slice(index + 1),
      ];
    }
  }

  // Function to get a random sample of tags
  getRandomTags(tags: string[], count = 3): string[] {
    const top20Tags = tags.slice(0, 20);
    return top20Tags.sort(() => 0.5 - Math.random()).slice(0, count);
  }

  // Handle form submission
  onSubmit(): void {
    if (this.workSkillsForm.valid) {
      const workSkills = {
        ...this.workSkillsForm.value,
        industries: this.addedIndustries,
        courseTags: this.addedCourseTags,
      };

      // Dispatch the setWorkSkills action with the form data
      this.store.dispatch(UserActions.setWorkSkills({ workSkills }));
    } else {
      console.log('Form is invalid');
    }
  }
}
