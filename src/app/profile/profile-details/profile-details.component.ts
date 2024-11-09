/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import {
  selectAvatarUrl,
  selectBasicInfo,
  selectDietNutrition,
  selectFinancialPlanning,
  selectIsProfileLoading,
  selectLifestyleHealth,
  selectMoreInfo,
  selectResume,
  selectWorkSkills,
} from '@store/user/user.selector';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-profile-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './profile-details.component.html',
  styleUrl: './profile-details.component.scss',
})
export class ProfileDetailsComponent {
  basicInfo$: Observable<any>;
  dietNutrition$: Observable<any>;
  financialPlanning$: Observable<any>;
  lifestyleHealth$: Observable<any>;
  moreInfo$: Observable<any>;
  resume$: Observable<any>;
  workSkills$: Observable<any>;
  avatarUrl$: Observable<any>;
  isLoading$: Observable<boolean>;

  constructor(
    private store: Store,
    private router: Router,
  ) {
    // Assign the selectors to observables
    this.basicInfo$ = this.store.select(selectBasicInfo);
    this.dietNutrition$ = this.store.select(selectDietNutrition);
    this.financialPlanning$ = this.store.select(selectFinancialPlanning);
    this.lifestyleHealth$ = this.store.select(selectLifestyleHealth);
    this.moreInfo$ = this.store.select(selectMoreInfo);
    this.resume$ = this.store.select(selectResume);
    this.workSkills$ = this.store.select(selectWorkSkills);
    this.avatarUrl$ = this.store.select(selectAvatarUrl);
    this.isLoading$ = this.store.select(selectIsProfileLoading);
  }

  generateAvatar() {
    this.router.navigate([`profile/create-avatar`]);
    // Add your logic for generating avatar
  }

  // Single function to handle edit action for any section
  editSection(sectionType: string): void {
    console.log(`Editing section: ${sectionType}`);
    // Logic to navigate to the respective edit section
    this.router.navigate([`profile/edit/${sectionType}`]);
  }
}
