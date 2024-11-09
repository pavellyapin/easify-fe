import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-suggested-action',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './suggested-action.component.html',
  styleUrl: './suggested-action.component.scss',
})
export class SuggestedActionComponent {
  @Input() title!: string; // Main title oåf the component
  @Input() actions: {
    title: string;
    subtext: string;
    buttonText: string;
    callback: () => void;
  }[] = []; // Array of actions
}
