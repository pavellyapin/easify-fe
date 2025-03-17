/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingCarouselComponent } from '@components/loading-carousel/loading-carousel.component';
import { Store } from '@ngrx/store';
import { GrowthService } from '@services/growth.service';
import { selectStartedIndustry } from '@store/started-growth/started-growth.selectors';
import {
  catchError,
  finalize,
  map,
  Observable,
  of,
  Subscription,
  take,
} from 'rxjs';
import { IndustryBreakdownComponent } from './industry-breakdown/industry-breakdown.component';
import { IndustryContentComponent } from './industry-content/industry-content.component';
import { IndustryIntroComponent } from './industry-intro/industry-intro.component';
import { IndustryStatsComponent } from './industry-stats/industry-stats.component';
import { IndustryCarouselComponent } from "../industry-carousel/industry-carousel.component";

@Component({
  selector: 'app-industry-overview',
  standalone: true,
  imports: [
    CommonModule,
    IndustryIntroComponent,
    LoadingCarouselComponent,
    MatIconModule,
    MatButtonModule,
    IndustryBreakdownComponent,
    IndustryStatsComponent,
    IndustryContentComponent,
    IndustryCarouselComponent
],
  templateUrl: './industry-overview.component.html',
  styleUrl: './industry-overview.component.scss',
})
export class IndustryOverviewComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = []; // Array to store subscriptions

  industry: any;
  recommendedIndustries: any[] = [];
  isLoadingRecommendedIndustries = true;
  startedIndustry$: Observable<any | null> | undefined; // Observable to get the started course
  isMobile = false;
  isTablet = false;

  constructor(
    private route: ActivatedRoute,
    private store: Store,
    private router: Router,
    private growthService: GrowthService,
    private breakpointObserver: BreakpointObserver,
  ) {}

  ngOnInit(): void {
    // Initialize startedCourse$ observable from the store
    this.startedIndustry$ = this.store.select(selectStartedIndustry);
    this.industry = this.route.snapshot.data['industry'];
    this.subscriptions.push(
      this.breakpointObserver
        .observe([Breakpoints.XSmall, Breakpoints.Small])
        .subscribe((result) => {
          const breakpoints = result.breakpoints;
          this.isMobile = breakpoints[Breakpoints.XSmall] ? true : false;
          this.isTablet = breakpoints[Breakpoints.Small] ? true : false;
        }),
    );
    this.loadRecommendedCourses();
  }

  loadRecommendedCourses(): void {
    this.subscriptions.push(
      this.growthService
        .recommendIndustries(this.industry.tags, 3)
        .pipe(
          take(1),
          map((response) => {
            this.recommendedIndustries = response.data || [];
            this.isLoadingRecommendedIndustries = false;
          }),
          catchError((error) => {
            console.error('Error fetching recommended courses:', error);
            this.isLoadingRecommendedIndustries = false;
            return of([]);
          }),
          finalize(() => {
            this.isLoadingRecommendedIndustries = false;
          }),
        )
        .subscribe(),
    );
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }

  navigateToBreadcrumb(destination: string): void {
    switch (destination) {
      case 'home':
        this.router.navigate(['dashboard']);
        break;
      case 'personalGrowthHub':
        this.router.navigate(['dashboard/personal-growth']);
        break;
      default:
        console.warn('Unrecognized breadcrumb destination:', destination);
    }
  }
}
