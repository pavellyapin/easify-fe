/* eslint-disable @typescript-eslint/no-floating-promises */
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { setLoading } from '@store/loader/loading.actions';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './error.component.html',
  styleUrl: './error.component.scss',
})
export class ErrorComponent implements OnInit {
  constructor(
    private store: Store,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // Dispatch setLoading(false) to update loading state in the store
    this.store.dispatch(setLoading(false));
  }

  navigateToDashboard(): void {
    this.router.navigate(['dashboard', 'dailylook']);
  }
}
