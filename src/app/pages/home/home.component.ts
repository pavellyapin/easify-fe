/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-extraneous-class */
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '@store/app.state';
import {
  setDashboardLoading,
  setGlobalLoading,
} from '@store/loader/loading.actions';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatButtonModule, MatCardModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  constructor(
    private router: Router,
    private store: Store<AppState>,
  ) {}

  ngOnInit(): void {
    // Dispatch action to set dashboardLoading to false
    this.store.dispatch(setDashboardLoading({ isLoading: false }));
    this.store.dispatch(setGlobalLoading({ isLoading: false }));
  }

  navigateToRegistration() {
    this.router.navigate(['main/signup']);
  }
}
