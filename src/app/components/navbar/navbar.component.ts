import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthService } from '@services/auth.service';
import { NotificationsService } from '@services/notifications.service';
import { selectUserState } from '@store/user/user.selector'; // Import the full state selector
import UserState from '@store/user/user.state';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatMenuModule,
    MatBadgeModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit {
  @Output() toggleSidenav = new EventEmitter<void>(); // Output to emit sidenav toggle event
  public notificationCount = 0; // Start notification count at 0
  public initials = ''; // Initials to display if no avatar
  public avatarUrl: string | null = null; // Avatar URL to display

  // User state observable
  public userState$: Observable<UserState>;

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationsService: NotificationsService, // Inject the NotificationsService
    private store: Store, // Inject the NgRx Store
  ) {
    // Get the full user state from the store
    this.userState$ = this.store.select(selectUserState);
  }

  ngOnInit(): void {
    this.loadNotificationCount(); // Load notification count when component initializes
    this.setInitialsAndAvatar(); // Set initials or avatar
  }

  // Fetch the unread notification count
  async loadNotificationCount(): Promise<void> {
    try {
      this.notificationCount =
        await this.notificationsService.getUnreadNotificationCount();
    } catch (error) {
      console.error('Error loading notification count:', error);
    }
  }

  // Logic to set initials or avatar based on user state
  setInitialsAndAvatar(): void {
    this.userState$.subscribe((userState: UserState) => {
      if (!userState.profileLoading) {
        if (userState.avatarUrl) {
          this.avatarUrl = userState.avatarUrl;
        } else {
          // Logic to get initials if avatar is not available
          if (userState.basicInfo?.name) {
            this.initials = userState.basicInfo.name.charAt(0).toUpperCase();
          } else if (userState.displayName) {
            this.initials = userState.displayName.charAt(0).toUpperCase();
          } else if (userState.email) {
            this.initials = userState.email.charAt(0).toUpperCase();
          }
        }
      }
    });
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
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

  // Method to emit toggle sidenav event
  onToggleSidenav(): void {
    this.toggleSidenav.emit(); // Emit the event to parent component
  }
}
