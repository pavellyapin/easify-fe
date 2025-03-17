/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from '@components/navbar/navbar.component';
import { filter, map, Subscription } from 'rxjs';

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
    MatProgressSpinnerModule,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit, OnDestroy {
  isMinimized = true; // To track whether sidenav is minimized
  sidenavMode: 'side' | 'over' = 'side'; // Initial sidenav mode is 'side'
  isMobile = false; // Tracks if the device is mobile
  isTablet = false; // Tracks if the device is tablet
  isRegisterFlow = false;
  subscriptions: Subscription[] = []; // ✅ Subscription tracking array

  constructor(
    private router: Router,
    private breakpointObserver: BreakpointObserver,
  ) {}

  ngOnInit(): void {
    // ✅ Observe screen size changes and adjust sidenav mode and state for mobile and tablet
    const breakpointSub = this.breakpointObserver
      .observe([Breakpoints.XSmall, Breakpoints.Small])
      .subscribe((result) => {
        const breakpoints = result.breakpoints;
        this.isMobile = !!breakpoints[Breakpoints.XSmall]; // True if mobile size
        this.isTablet = !!breakpoints[Breakpoints.Small]; // True if tablet size

        if (this.isTablet) {
          this.sidenavMode = 'side';
          this.isMinimized = true;
        } else if (this.isMobile) {
          this.sidenavMode = 'over';
        } else {
          this.sidenavMode = 'side';
          this.isMinimized = true;
        }
      });

    this.subscriptions.push(breakpointSub);

    const registerSub = this.router.events
      .pipe(
        filter((event: any) => event.routerEvent instanceof NavigationEnd), // ✅ Check nested routerEvent
        map((event: any) => event.routerEvent as NavigationEnd), // ✅ Extract correct event type
      )
      .subscribe((event) => {
        this.isRegisterFlow = event.url.includes('/register');
      });

    this.subscriptions.push(registerSub);

    // ✅ Listen to router events to scroll to the top after navigation ends
    const routerSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        const scrollContainer = document.querySelector('.mat-drawer-content');
        if (scrollContainer) {
          scrollContainer.scrollTo(0, 0);
        }
        window.scrollTo(0, 0);
      });

    this.subscriptions.push(routerSub);
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);

    // Close sidenav if mobile
    if (this.isMobile) {
      this.isMinimized = true;
    }
  }

  toggleSidebar() {
    if (this.isTablet) {
      this.isMinimized = !this.isMinimized;
      this.sidenavMode = this.isMinimized ? 'side' : 'over';
    } else {
      this.isMinimized = !this.isMinimized;
    }
  }

  // ✅ Unsubscribe from all subscriptions when component is destroyed
  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }
}
