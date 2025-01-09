/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SuggestedActionComponent } from '@components/suggested-action/suggested-action.component';
import { ChallengeService } from '@services/challenges.service';
import { ScheduleComponent } from './schedule/schedule.component';

@Component({
  selector: 'app-daily-look',
  standalone: true,
  imports: [CommonModule, ScheduleComponent, SuggestedActionComponent],
  templateUrl: './daily-look.component.html',
  styleUrl: './daily-look.component.scss',
})
export class DailyLookComponent implements OnInit {
  firstIncompleteChallenge: any;

  constructor(
    private challengesService: ChallengeService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadFirstIncompleteChallenge();
  }

  private async loadFirstIncompleteChallenge() {
    try {
      this.firstIncompleteChallenge =
        await this.challengesService.getFirstIncompleteChallengeByType('daily');
    } catch (error) {
      console.error('Error loading first incomplete challenge:', error);
    }
  }

  // Function to create a custom day
  createCustomDay() {
    console.log('Complete Module 1 action triggered');
    this.router.navigate(['dashboard/custom-day']);
  }

  // Function to review quiz results
  reviewQuizResults() {
    console.log('Review Quiz Results action triggered');
  }

  // Function to submit an assignment
  submitAssignment() {
    console.log('Submit Assignment action triggered');
  }
}
