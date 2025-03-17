/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { ChatComponent } from '@components/chat/chat.component';
import { LoadingComponent } from '@components/loading/loading.component';
import { NavbarComponent } from '@components/navbar/navbar.component';
import { Store } from '@ngrx/store';
import { AuthService } from '@services/auth.service';
import { isDashboardLoading } from '@store/loader/loading.selectors';
import { filter, Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    NavbarComponent,
    MatProgressSpinnerModule,
    ChatComponent,
    LoadingComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  isMinimized = true; // Tracks whether sidenav is minimized
  sidenavMode: 'side' | 'over' = 'side'; // Initial sidenav mode
  isMobile = false; // Tracks if the device is mobile
  isTablet = false; // Tracks if the device is tablet
  isChatOpen = false;
  loading$!: Observable<any>;
  private subscriptions: Subscription[] = []; // Array to track subscriptions

  constructor(
    private router: Router,
    private store: Store,
    private breakpointObserver: BreakpointObserver,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.loading$ = this.store.select(isDashboardLoading);

    // Observe screen size changes and adjust sidenav mode and state for mobile and tablet
    const breakpointSub = this.breakpointObserver
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
    this.subscriptions.push(breakpointSub);

    // Listen to router events to scroll to the top after navigation ends
    const routerEventSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        const scrollContainer = document.querySelector('.mat-drawer-content');
        if (scrollContainer) {
          scrollContainer.scrollTo(0, 0);
        }
        window.scrollTo(0, 0); // Scroll to the top of the page
      });
    this.subscriptions.push(routerEventSub);
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);

    // Close sidenav if mobile
    if (this.isMobile) {
      this.isMinimized = true; // Close sidenav on mobile after navigating
    }
  }

  toggleChat(event: any) {
    this.isChatOpen = event;
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
  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Logout error:', error);
      },
    });
  }
}
