/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @angular-eslint/prefer-output-readonly */
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-custom-day-step-actions',
  standalone: true,
  imports: [MatButtonModule, CommonModule],
  templateUrl: './step-actions.component.html',
  styleUrl: './step-actions.component.scss',
})
export class CustomDayStepActionsComponent {
  @Output() primaryButton = new EventEmitter<void>();
  @Output() secondaryButton = new EventEmitter<void>();
  @Input() final = false;
  @Input() primaryLabel: any;
  @Input() secondaryLabel: any;

  // Method to emit primary button click event
  onPrimaryClick(): void {
    this.primaryButton.emit();
  }

  // Method to emit secondary button click event
  onSecondaryClick(): void {
    this.secondaryButton.emit();
  }
}
