/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { SuggestedActionComponent } from '@components/suggested-action/suggested-action.component';
import { CapitalizePipe } from '@services/capitalize.pipe';

@Component({
  selector: 'app-industry-stats',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    SuggestedActionComponent,
    CapitalizePipe,
    MatProgressBarModule,
  ],
  templateUrl: './industry-stats.component.html',
  styleUrl: './industry-stats.component.scss',
})
export class IndustryStatsComponent {
  @Input() industry: any;
  @Input() isMobile = false;
  @Input() isTablet = false;
  @Input() startedIndustry: any;
  completeModule() {
    console.log('');
  }
}
