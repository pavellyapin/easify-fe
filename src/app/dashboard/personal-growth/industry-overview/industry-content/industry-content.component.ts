/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TopicLoaderComponent } from '@components/topic-loader/topic-loader.component';
import {
  SlickCarouselComponent,
  SlickCarouselModule,
} from 'ngx-slick-carousel';

@Component({
  selector: 'app-industry-content',
  standalone: true,
  imports: [
    CommonModule,
    SlickCarouselModule,
    MatIconModule,
    MatButtonModule,
    TopicLoaderComponent,
    MatBadgeModule,
  ],
  templateUrl: './industry-content.component.html',
  styleUrl: './industry-content.component.scss',
})
export class IndustryContentComponent implements OnInit {
  @Input() industry: any;
  @Input() isMobile = false;
  @Input() isTablet = false;
  @Input() startedIndustry: any;
  currentIndex = 0;
  carouselCards!: any[];
  loading = false;
  initLoading = false;
  slideConfig = {
    slidesToShow: 1,
    slidesToScroll: 1,
    vertical: true,
    verticalSwiping: false,
    infinite: false,
  };
  @ViewChild('slickModal') slickModal!: SlickCarouselComponent;

  ngOnInit(): void {
    this.extractIndustryInsights(); // ✅ Runs automatically when component initializes
  }

  extractIndustryInsights(): void {
    if (!this.industry?.detailedInfo) {
      console.warn('Industry data is missing.');
      this.carouselCards = [];
      return;
    }

    const {
      challenges,
      majorTrends,
      jobOutlook,
      educationalRequirements,
      workEnvironment,
    } = this.industry.detailedInfo;

    // Function to format insights (supports both strings & objects)
    const formatInsights = (items: any[]): string[] =>
      items.map((item) =>
        typeof item === 'string'
          ? item
          : `${item.name ? item.name + ': ' : ''}${item.description || ''}`,
      );

    // Function to format job outlook data
    const formatJobOutlook = (jobOutlook: any): string[] => {
      return [
        jobOutlook.demand ? `Demand: ${jobOutlook.demand}` : '',
        jobOutlook.expectedGrowth
          ? `Expected Growth: ${jobOutlook.expectedGrowth}`
          : '',
      ].filter(Boolean);
    };

    // Function to create a card with multiple insights in bullet points
    const createCard = (type: string, header: string, insights: any[]) => ({
      type,
      header,
      content:
        insights.length > 0
          ? insights.map((i) => `• ${i}`).join('\n')
          : 'No data available',
    });

    // ✅ Group all items of the same type into a single card
    const cards = [
      ...(challenges?.length
        ? [
            createCard(
              'Challenges',
              'Industry Challenges',
              formatInsights(challenges),
            ),
          ]
        : []),
      ...(majorTrends?.length
        ? [createCard('Trends', 'Major Trends', formatInsights(majorTrends))]
        : []),
      ...(jobOutlook
        ? [
            createCard(
              'Job Outlook',
              'Future Job Prospects',
              formatJobOutlook(jobOutlook),
            ),
          ]
        : []),
      ...(educationalRequirements
        ? [
            createCard('Education', 'Required Education', [
              formatInsights(educationalRequirements),
            ]),
          ]
        : []),
      ...(workEnvironment
        ? [
            createCard('Work Environment', 'Typical Work Conditions', [
              formatInsights(workEnvironment),
            ]),
          ]
        : []),
    ];

    this.carouselCards = cards;
  }

  goToPreviousSlide(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.slickModal.slickPrev();
    }
  }

  goToNextSlide(): void {
    if (this.currentIndex < this.carouselCards.length - 1) {
      this.currentIndex++;
      this.slickModal.slickNext();
    }
  }

  expandPoint(pointIndex: number): void {
    const point = this.carouselCards[pointIndex];

    // Check if the point has a response
    if (point.hasResponse) {
      // Set initLoading to true
      this.initLoading = true;

      // Add a 3-second delay before navigating
      setTimeout(() => {
        this.initLoading = false; // Stop loading state
      }, 3000);
    } else {
      // Proceed with Easify service call if no response exists
      this.initLoading = true;
    }
  }
}
