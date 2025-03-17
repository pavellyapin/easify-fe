/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { SuggestedActionComponent } from '@components/suggested-action/suggested-action.component';
import { Store } from '@ngrx/store';
import { selectMiniResume } from '@store/started-growth/started-growth.selectors';
import { Subscription } from 'rxjs';
import { MiniResumeComponent } from './mini-resume/mini-resume.component';
import { ResumeUploadComponent } from './resume-upload/resume-upload.component';
import { AllIndustriesComponent } from "./all-industries/all-industries.component";
import { IndustrySearchBoxComponent } from "./industry-search-box/industry-search-box.component";

@Component({
  selector: 'app-personal-growth',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    SuggestedActionComponent,
    ResumeUploadComponent,
    MiniResumeComponent,
    AllIndustriesComponent,
    IndustrySearchBoxComponent
],
  templateUrl: './personal-growth.component.html',
  styleUrl: './personal-growth.component.scss',
})
export class PersonalGrowthComponent implements OnInit, OnDestroy {
  isMobile = false;
  isTablet = false;
  hasMiniResume = false; // Variable to track if mini resume exists
  miniResumeData: any = null; // Store mini resume data
  private subscriptions: Subscription[] = [];

  constructor(
    private breakpointObserver: BreakpointObserver,
    private store: Store,
  ) {}

  ngOnInit(): void {
    // Subscribe to breakpoint observer
    this.subscriptions.push(
      this.breakpointObserver
        .observe([Breakpoints.XSmall, Breakpoints.Small])
        .subscribe((result) => {
          const breakpoints = result.breakpoints;
          this.isMobile = breakpoints[Breakpoints.XSmall] ? true : false;
          this.isTablet = breakpoints[Breakpoints.Small] ? true : false;
        }),
    );

    // Subscribe to the mini resume from the state
    this.subscriptions.push(
      this.store.select(selectMiniResume).subscribe((miniResume) => {
        this.hasMiniResume = !!miniResume;
        this.miniResumeData = miniResume?.analysis || null;
      }),
    );
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }

  // Example function for completing a module
  completeModule(): void {
    console.log('Complete Module action triggered');
    // Add your logic here for completing the module
  }
}
