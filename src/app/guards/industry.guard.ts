/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  UrlTree,
} from '@angular/router';
import { Store } from '@ngrx/store';
import { GrowthProgressService } from '@services/growth-progress.service';
import { GrowthService } from '@services/growth.service';
import {
  loadIndustryEasifyResponsesSuccess,
  loadStartedIndustrySuccess,
} from '@store/started-growth/started-growth.actions';

@Injectable({
  providedIn: 'root',
})
export class IndustryGuard implements CanActivate {
  constructor(
    private industryService: GrowthService,
    private industryProgressService: GrowthProgressService,
    private router: Router,
    private store: Store,
  ) {}

  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean | UrlTree> {
    const industryId = route.paramMap.get('id')!;
    try {
      // ✅ Fetch the industry by ID
      const industry = await this.industryService.getIndustryById(industryId);

      if (!industry) {
        console.error(`Industry with ID ${industryId} not found.`);
        return this.router.parseUrl('error'); // Redirect if industry not found
      }

      route.data = { industry };

      // ✅ Check if the user has started tracking this industry
      let startedIndustry =
        await this.industryProgressService.getStartedIndustryById(industryId);

      if (!startedIndustry) {
        // Helper function to get a random sample of 3 jobs
        const getRandomJobs = (jobsArray: any[]) => {
          if (!Array.isArray(jobsArray) || jobsArray.length === 0) {
            return [];
          }
          const shuffled = [...jobsArray].sort(() => 0.5 - Math.random());
          return shuffled.slice(0, 3);
        };
        // ✅ If no progress exists, create a new one
        const newIndustryItem = {
          id: industryId,
          createdDate: industry.createdDate,
          name: industry.name,
          isNew: industry.isNew ? industry.isNew : false,
          category: industry.detailedInfo.category,
          description: industry.detailedInfo.description,
          jobsCount: industry.jobs.length,
          jobsSample: getRandomJobs(industry.jobs),
          averageSalaryRange: industry.detailedInfo.averageSalaryRange,
          tags: industry.tags,
        };

        // ✅ Compute industry progress based on key metrics
        const progress = {
          trendsReviewed: 0,
          companiesReviewed: 0,
          progress: 0, // Start at 0%
        };

        await this.industryProgressService.addIndustryStart(
          newIndustryItem,
          progress,
        );

        startedIndustry =
          await this.industryProgressService.getStartedIndustryById(industryId);

        // ✅ Store new industry progress in NgRx store
        this.store.dispatch(
          loadStartedIndustrySuccess({
            startedIndustry,
          }),
        );

        return true;
      }

      // ✅ Dispatch action to store industry progress
      this.store.dispatch(loadStartedIndustrySuccess({ startedIndustry }));

      // ✅ Fetch Easify responses for the industry
      const easifyResponses =
        await this.industryProgressService.getEasifyResponsesByItemId(
          industryId,
        );

      // ✅ Dispatch action to store Easify responses
      this.store.dispatch(
        loadIndustryEasifyResponsesSuccess({
          responses: easifyResponses,
        }),
      );

      return true; // Allow navigation
    } catch (error) {
      console.error('Error in IndustryGuard:', error);
      return this.router.parseUrl('/error'); // Redirect on error
    }
  }
}
