/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { Router } from '@angular/router';
import { FinancialPlansService } from '@services/financial.service';

@Component({
  selector: 'app-financial-plan-tile',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatChipsModule, MatButtonModule],
  templateUrl: './financial-plan-tile.component.html',
  styleUrl: './financial-plan-tile.component.scss',
})
export class FinancialPlanTileComponent {
  @Input() financialPlan!: any;

  constructor(
    private router: Router,
    private financialPlansService: FinancialPlansService,
  ) {}

  async startFinancialPlan(planId: string): Promise<void> {
    try {
      // Add the financial plan start information to Firestore using the service
      await this.financialPlansService.addPlanStart(this.financialPlan);

      // Navigate to the financial plan dashboard
      this.router.navigate(['dashboard/financial-plan', planId]);
    } catch (error: any) {
      console.error('Failed to start financial plan:', error);
    }
  }
}
