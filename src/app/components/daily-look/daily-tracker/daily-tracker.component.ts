/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router'; // Assuming routing is used for navigation

@Component({
  selector: 'app-daily-tracker',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
  ],
  templateUrl: './daily-tracker.component.html',
  styleUrl: './daily-tracker.component.scss', // Ensure it's plural styleUrls
})
export class DailyTrackerComponent {
  @Input() challenge: any;

  constructor(private router: Router) {} // Injecting router to navigate

  onArrowClick() {
    console.log('Arrow clicked!');
    const { completedSteps = [] } = this.challenge;
    const priorityOrder = [
      'basicInfo',
      'workSkills',
      'resume',
      'lifestyleHealth',
      'dietNutrition',
      'financialPlanning',
      'moreInfo',
      'loginStreak',
      'totalLogins',
    ];

    // Find the first incomplete step based on priority
    const nextStepKey = priorityOrder.find(
      (key) => !completedSteps.includes(key),
    );

    if (!nextStepKey) {
      console.log('All steps completed.');
      return;
    }

    // Handle each step with specific logic
    switch (nextStepKey) {
      case 'basicInfo':
        console.log('Redirecting to basic info form.');
        this.router.navigate(['/profile/edit/basic-info']); // Replace with actual route
        break;

      case 'dietNutrition':
        console.log('Redirecting to diet and nutrition section.');
        this.router.navigate(['/profile/edit/diet-nutrition']); // Replace with actual route
        break;

      case 'financialPlanning':
        console.log('Redirecting to financial planning.');
        this.router.navigate(['/profile/edit/financial-planning']); // Replace with actual route
        break;

      case 'lifestyleHealth':
        console.log('Redirecting to lifestyle and health section.');
        this.router.navigate(['/profile/edit/lifestyle-health']); // Replace with actual route
        break;

      case 'moreInfo':
        console.log('Redirecting to more information section.');
        this.router.navigate(['/profile/edit/more-info']); // Replace with actual route
        break;

      case 'resume':
        console.log('Redirecting to resume upload.');
        this.router.navigate(['/profile/edit/upload-resume']); // Replace with actual route
        break;

      case 'workSkills':
        console.log('Redirecting to work skills section.');
        this.router.navigate(['/profile/edit/work-skills']); // Replace with actual route
        break;

      case 'loginStreak':
        console.log('Handling login streak progress.');
        // Custom logic for login streak if any
        break;

      case 'totalLogins':
        console.log('Handling total logins progress.');
        // Custom logic for total logins if any
        break;

      default:
        console.log('Unknown step:', nextStepKey);
        break;
    }
  }
}
