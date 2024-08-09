/* eslint-disable @typescript-eslint/no-unsafe-call */
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { isLoading } from './store/loader/loading.selectors';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MatProgressSpinnerModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'extreme-angular';
  loading$!: Observable<boolean>;

  constructor(private store: Store) {}

  ngOnInit() {
    this.loading$ = this.store.select(isLoading);
  }
}
