/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CapitalizePipe } from '@services/capitalize.pipe';

@Component({
  selector: 'app-course-intro',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    CapitalizePipe,
    MatProgressBarModule,
  ],
  templateUrl: './course-intro.component.html',
  styleUrl: './course-intro.component.scss',
})
export class CourseIntroComponent {
  @Input() course: any;
  @Input() isMobile = false;
  @Input() isTablet = false;
  @Input() startedCourse: any;

  getRemainingPercentage(): number {
    return Math.round(100 - this.startedCourse.progress.progress);
  }
  getAdditionalResources(): string[] {
    const { additionalResources } = this.course || {};
    return Array.isArray(additionalResources)
      ? additionalResources
      : [additionalResources];
  }
}
