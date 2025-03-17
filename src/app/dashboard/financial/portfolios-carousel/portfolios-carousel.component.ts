/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {
  SlickCarouselComponent,
  SlickCarouselModule,
} from 'ngx-slick-carousel';
import { FinancialPlanTileComponent } from '../financial-plan-tile/financial-plan-tile.component';

@Component({
  selector: 'app-portfolios-carousel',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    SlickCarouselModule,
    FinancialPlanTileComponent,
  ],
  templateUrl: './portfolios-carousel.component.html',
  styleUrl: './portfolios-carousel.component.scss',
})
export class PortfoliosCarouselComponent implements AfterViewInit {
  @Input() portfolios: any[] = [];
  @ViewChild('slickModal') slickModal!: SlickCarouselComponent;

  slideConfig = {
    slidesToShow: 2, // The number of slides to show
    slidesToScroll: 1, // Number of slides to scroll at a time
    infinite: true, // Set to false if you want to disable looping
    dots: false, // Enable/disable dots
    //centerMode: true, // Enables partial view of next slide
    //centerPadding: '50px',
    variableWidth: false, // Adjust the width of the items dynamically
    responsive: [
      {
        breakpoint: 960, // For screens below 960px
        settings: {
          slidesToShow: 2, // Show only 2 slides at a time on medium screens
          slidesToScroll: 1,
          centerMode: true, // Enables partial view of next slide
          centerPadding: '50px', // Center the single item
          variableWidth: false, // Adjust the width dynamically
        },
      },
      {
        breakpoint: 768, // For screens below 768px
        settings: {
          slidesToShow: 1, // Show only 1 slide at a time on smaller screens
          slidesToScroll: 1,
          centerMode: true, // Enables partial view of next slide
          centerPadding: '50px', // Center the single item
          variableWidth: false, // Adjust the width dynamically
        },
      },
    ],
  };

  ngAfterViewInit(): void {
    // Automatically slide to the next item after initialization
    setTimeout(() => {
      if (this.slickModal) {
        this.slickModal.slickGoTo(1); // Move to the second slide (index 1)
      }
    }, 0); // Delay to ensure Slick Carousel is fully initialized
  }
}
