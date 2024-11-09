import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-alert-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './alert-card.component.html',
  styleUrl: './alert-card.component.scss',
})
export class AlertCardComponent {
  @Input() message = 'Your information is private and secure.'; // Default message
  @Input() icon = 'info'; // Default icon
  @Input() color = 'primary'; // Default color
}
