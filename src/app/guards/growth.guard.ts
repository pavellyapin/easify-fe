/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Store } from '@ngrx/store';
import { GrowthProgressService } from '@services/growth-progress.service';
import * as StartedGrowthActions from '@store/started-growth/started-growth.actions';

@Injectable({
  providedIn: 'root',
})
export class GrowthGuard implements CanActivate {
  constructor(
    private growthProgressService: GrowthProgressService,
    private store: Store,
  ) {}

  async canActivate(): Promise<boolean> {
    try {
      // Call getUserMiniResume to fetch the mini resume
      const miniResume = await this.growthProgressService.getUserMiniResume();

      if (miniResume) {
        // Save the mini resume to the state
        this.store.dispatch(
          StartedGrowthActions.loadMiniResumeSuccess({ miniResume }),
        );
        // Allow navigation
      }
      return true;
    } catch (error) {
      console.error('Error in GrowthGuard:', error);
      this.store.dispatch(
        StartedGrowthActions.loadMiniResumeFailure({ error }),
      );
      return true;
    }
  }
}
