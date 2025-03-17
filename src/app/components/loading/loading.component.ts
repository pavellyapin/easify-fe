import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectDashboardLoadingMsg } from '@store/loader/loading.selectors';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.scss',
})
export class LoadingComponent {
  dashboardLoadingMsg$: Observable<string>;

  constructor(private store: Store) {
    this.dashboardLoadingMsg$ = this.store.select(selectDashboardLoadingMsg);
  }
}
