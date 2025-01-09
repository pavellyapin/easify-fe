/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { isGlobalLoading } from '@store/loader/loading.selectors';
import { Observable } from 'rxjs';
import { LoadingComponent } from './components/loading/loading.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoadingComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'extreme-angular';
  isLoading$: Observable<boolean>;
  constructor(private store: Store) {
    // Initialize the observable with the global loading selector
    this.isLoading$ = this.store.select(isGlobalLoading);
  }
}
