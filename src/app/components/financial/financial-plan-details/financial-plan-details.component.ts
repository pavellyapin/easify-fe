/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FinancialPlansService } from '@services/financial.service';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { Observable, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-financial-plan-details',
  standalone: true,
  imports: [CommonModule, SlickCarouselModule],
  templateUrl: './financial-plan-details.component.html',
  styleUrl: './financial-plan-details.component.scss',
})
export class FinancialPlanDetailsComponent implements OnInit {
  financialPlan$!: Observable<any>;
  relatedPlans: any[] = []; // Array to hold related financial plans
  slideConfig = {
    slidesToShow: 3,
    slidesToScroll: 1,
    dots: true,
    infinite: false,
    autoplay: false,
  };

  constructor(
    private route: ActivatedRoute,
    private financialPlansService: FinancialPlansService, // Service for financial plans
  ) {}

  ngOnInit(): void {
    this.financialPlan$ = this.route.paramMap.pipe(
      switchMap((params) => {
        const id = params.get('id');
        return this.financialPlansService.getPlanById(id!);
      }),
      tap((plan) => {
        if (plan && plan.tags) {
          this.fetchRelatedPlans(plan.tags);
        }
      }),
    );
  }

  fetchRelatedPlans(tags: string[]): void {
    this.financialPlansService
      .recommendPlans(tags, 5)
      .pipe(
        tap((relatedPlans) => {
          this.relatedPlans = relatedPlans.data;
        }),
        catchError((error) => {
          console.error('Error fetching related financial plans:', error);
          return of([]); // Handle the error, perhaps returning an empty array
        }),
      )
      .subscribe();
  }
}
