/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent implements OnInit, OnDestroy {
  isMinimized = true; // Tracks whether sidenav is minimized
  sidenavMode: 'side' | 'over' = 'side'; // Initial sidenav mode
  isMobile = false; // Tracks if the device is mobile
  isTablet = false; // Tracks if the device is tablet
  private subscriptions: Subscription[] = []; // Array to hold subscriptions

  constructor(
    private router: Router,
    private breakpointObserver: BreakpointObserver,
  ) {}

  ngOnInit() {
    // Observe screen size changes and adjust sidenav mode and state for mobile and tablet
    const breakpointSub = this.breakpointObserver
      .observe([Breakpoints.XSmall, Breakpoints.Small])
      .subscribe((result) => {
        const breakpoints = result.breakpoints;
        this.isMobile = breakpoints[Breakpoints.XSmall] ? true : false; // True if mobile size
        this.isTablet = breakpoints[Breakpoints.Small] ? true : false; // True if tablet size

        if (this.isTablet) {
          this.sidenavMode = 'side'; // Set sidenav to 'side' mode on tablet
          this.isMinimized = true; // Minimize the sidenav by default on tablet
        } else if (this.isMobile) {
          this.sidenavMode = 'over'; // Set sidenav to 'over' mode on mobile
        } else {
          this.sidenavMode = 'side'; // Default to 'side' mode on larger screens
          this.isMinimized = true; // Ensure sidenav is not minimized on larger screens
        }
      });
    this.subscriptions.push(breakpointSub);
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);

    // Close sidenav if mobile
    if (this.isMobile) {
      this.isMinimized = true; // Close sidenav on mobile after navigating
    }
  }

  toggleSidebar() {
    // Toggle sidebar based on current state and device
    if (this.isTablet) {
      this.isMinimized = !this.isMinimized;

      // If minimized, change to 'over' mode to allow full sidenav overlay when reopened
      if (!this.isMinimized) {
        this.sidenavMode = 'over';
      } else {
        this.sidenavMode = 'side';
      }
    } else {
      this.isMinimized = !this.isMinimized;
    }
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }
}
