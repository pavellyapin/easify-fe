/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from '@components/navbar/navbar.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatSidenavModule,
    MatToolbarModule,
    NavbarComponent,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  isMinimized = true; // To track whether sidenav is minimized
  sidenavMode: 'side' | 'over' = 'side'; // Initial sidenav mode is 'side'
  isMobile = false; // Tracks if the device is mobile
  isTablet = false; // Tracks if the device is tablet

  constructor(
    private router: Router,
    private breakpointObserver: BreakpointObserver,
  ) {}

  ngOnInit(): void {
    // Observe screen size changes and adjust sidenav mode and state for mobile and tablet
    this.breakpointObserver
      .observe([Breakpoints.XSmall, Breakpoints.Small]) // Observing both mobile (XSmall) and tablet (Small)
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
}
