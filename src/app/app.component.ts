/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { AnalyticsService } from '@services/analytics.service';
import { isGlobalLoading } from '@store/loader/loading.selectors';
import { Observable } from 'rxjs';
import { LoadingComponent } from './components/loading/loading.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoadingComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  isLoading$: Observable<any>;
  constructor(
    private store: Store,
    private analyticsService: AnalyticsService,
  ) {
    // Initialize the observable with the global loading selector
    this.isLoading$ = this.store.select(isGlobalLoading);
  }
  ngOnInit(): void {
    this.analyticsService.init(); // ✅ Call Analytics init here
  }
}
