/* eslint-disable @typescript-eslint/no-unsafe-call */
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'extreme-angular';

  constructor(private router: Router) {}

  ngOnInit() {
    // Listen to router events to scroll to the top after navigation ends
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        const scrollContainer = document.querySelector('.mat-drawer-content');
        if (scrollContainer) {
          scrollContainer.scrollTo(0, 0);
        }
        window.scrollTo(0, 0); // Scroll to the top of the page
      });
  }
}
