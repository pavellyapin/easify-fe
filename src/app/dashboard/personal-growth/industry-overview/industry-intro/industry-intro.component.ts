/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CapitalizePipe } from '@services/capitalize.pipe';

@Component({
  selector: 'app-industry-intro',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    CapitalizePipe,
    MatProgressBarModule,
  ],
  templateUrl: './industry-intro.component.html',
  styleUrl: './industry-intro.component.scss',
})
export class IndustryIntroComponent {
  @Input() industry: any;
  @Input() isMobile = false;
  @Input() isTablet = false;
  @Input() startedIndustry: any;

  getRemainingPercentage(): number {
    return Math.round(100 - this.startedIndustry.progress.progress);
  }
}
