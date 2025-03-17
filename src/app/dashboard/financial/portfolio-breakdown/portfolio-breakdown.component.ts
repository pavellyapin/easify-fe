/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/use-unknown-in-catch-callback-variable */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  ActivatedRoute,
  ParamMap,
  Router,
  RouterOutlet,
} from '@angular/router';
import { Store } from '@ngrx/store';
import { selectStartedPortfolio } from '@store/started-portfolio/started-portfolio.selectors';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { Subscription } from 'rxjs';
import { PortfolioNavComponent } from '../portfolio-nav/portfolio-nav.component';

@Component({
  selector: 'app-portfolio-breakdown',
  standalone: true,
  imports: [
    CommonModule,
    SlickCarouselModule,
    MatIconModule,
    MatButtonModule,
    RouterOutlet,
    PortfolioNavComponent,
  ],
  templateUrl: './portfolio-breakdown.component.html',
  styleUrl: './portfolio-breakdown.component.scss',
})
export class PortfolioBreakdownComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = []; // Array to store subscriptions

  portfolio: any;
  portfolioId: any;
  startedPortfolio: any;
  loading = false;
  isMobile = false;
  isTablet = false;

  constructor(
    public route: ActivatedRoute,
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    private store: Store,
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      // Second subscription: Handle updates to startedWorkout
      this.store
        .select(selectStartedPortfolio)
        .subscribe((startedPortfolio) => {
          this.startedPortfolio = startedPortfolio;
        }),
    );

    this.subscriptions.push(
      this.route.paramMap.subscribe((params: ParamMap) => {
        this.loading = true;
        this.portfolioId = params.get('id')!;
        this.portfolio = this.route.snapshot.data['portfolio'];
        setTimeout(() => {
          this.loading = false;
        }, 300);
      }),
    );

    this.subscriptions.push(
      this.breakpointObserver
        .observe([Breakpoints.XSmall, Breakpoints.Small])
        .subscribe((result) => {
          const breakpoints = result.breakpoints;
          this.isMobile = breakpoints[Breakpoints.XSmall] ? true : false;
          this.isTablet = breakpoints[Breakpoints.Small] ? true : false;
        }),
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
      case 'financeHub':
        this.router.navigate(['dashboard/financial']);
        break;
      case 'portfolio':
        this.router.navigate([
          `dashboard/portfolio/${this.portfolioId}/overview`,
        ]);
        break;
      default:
        console.warn('Unrecognized breadcrumb destination:', destination);
    }
  }
}
