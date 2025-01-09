/* eslint-disable @typescript-eslint/no-floating-promises */
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './error.component.html',
  styleUrl: './error.component.scss',
})
export class ErrorComponent {
  constructor(private router: Router) {}

  navigateToDashboard(): void {
    this.router.navigate(['dashboard', 'dailylook']);
  }
}
