/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { CapitalizePipe } from '@services/capitalize.pipe';
import { setDashboardLoading } from '@store/loader/loading.actions';

@Component({
  selector: 'app-industry-tile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatChipsModule,
    MatButtonModule,
    MatProgressBar,
    MatIconModule,
    MatTooltipModule,
    CapitalizePipe,
  ],
  templateUrl: './industry-tile.component.html',
  styleUrl: './industry-tile.component.scss',
})
export class IndustryTileComponent {
  @Input() industry!: any;

  constructor(
    private router: Router,
    private store: Store,
  ) {}

  startIndustry(industryId: string) {
    this.store.dispatch(setDashboardLoading({ isLoading: true }));
    try {
      setTimeout(() => {
        this.router.navigate(['dashboard/industry/', industryId]).then(() => {
          this.store.dispatch(setDashboardLoading({ isLoading: false }));
        });
      }, 200);
    } catch (error: any) {
      console.error('Failed to start industry:', error);
    }
  }
}
