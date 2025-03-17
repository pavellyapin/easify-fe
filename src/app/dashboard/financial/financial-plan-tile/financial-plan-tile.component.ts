/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { CapitalizePipe } from '@services/capitalize.pipe';
import { FinancialPlansService } from '@services/financial.service';
import { setDashboardLoading } from '@store/loader/loading.actions';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-financial-plan-tile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatChipsModule,
    MatButtonModule,
    NgxChartsModule,
    CapitalizePipe,
    MatIconModule,
    MatTooltipModule,
    MatProgressBarModule,
  ],
  templateUrl: './financial-plan-tile.component.html',
  styleUrl: './financial-plan-tile.component.scss',
})
export class FinancialPlanTileComponent implements OnInit, AfterViewInit {
  @Input() financialPlan!: any;
  graphData: any;
  chartView: [number, number] = [300, 200]; // Default size
  customColors = [{ name: 'Total Portfolio Value', value: '#56c98a' }];

  @ViewChild('chartContainer', { static: false }) chartContainer:
    | ElementRef
    | undefined;
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    public financialService: FinancialPlansService,
    private store: Store,
  ) {}

  ngOnInit() {
    this.graphData = this.financialService.prepareProgressData(
      this.financialPlan.portfolioValues,
    );
    this.setupResponsiveChart();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.updateChartSize();
    }, 100); // Ensure DOM is ready before measuring
  }

  setupResponsiveChart(): void {
    this.subscriptions.push(
      this.breakpointObserver
        .observe([
          Breakpoints.XSmall,
          Breakpoints.Small,
          Breakpoints.Medium,
          Breakpoints.Large,
          Breakpoints.XLarge,
        ])
        .subscribe(() => {
          this.updateChartSize();
        }),
    );
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.updateChartSize();
  }

  private updateChartSize(): void {
    if (!this.chartContainer?.nativeElement) return;

    const containerWidth = this.chartContainer.nativeElement.clientWidth;

    let width = containerWidth - 20; // Subtract padding
    let height = width * 0.6; // Maintain aspect ratio

    // Ensure a minimum size for usability
    width = Math.max(width, 250);
    height = Math.max(height, 150);

    this.chartView = [width, height];
  }

  startFinancialPlan(planId: string) {
    this.store.dispatch(setDashboardLoading({ isLoading: true }));
    try {
      setTimeout(() => {
        this.router.navigate(['dashboard/portfolio', planId]).then(() => {
          this.store.dispatch(setDashboardLoading({ isLoading: false }));
        });
      }, 200);
    } catch (error: any) {
      console.error('Failed to start financial plan:', error);
    }
  }
}
