/* eslint-disable @angular-eslint/prefer-output-readonly */
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-schedule-stats',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './schedule-stats.component.html',
  styleUrl: './schedule-stats.component.scss',
})
export class ScheduleStatsComponent {
  @Input() tomorrow!: {
    date: string;
    day: string;
    model: string;
    type: string;
  };
  @Input() today!: { date: string; day: string; model: string; type: string };
  @Input() viewingTomorrow!: boolean;
  @Output() daySelected = new EventEmitter<boolean>();
  @Input()
  isMobile = false;
  @Input()
  isTablet = false;

  onDaySelected(): void {
    // Emit the opposite of the current viewing state
    this.daySelected.emit(!this.viewingTomorrow);
  }
}
