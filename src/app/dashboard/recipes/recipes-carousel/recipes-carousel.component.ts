/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {
  SlickCarouselComponent,
  SlickCarouselModule,
} from 'ngx-slick-carousel';
import { RecipeTileComponent } from '../recipe-tile/recipe-tile.component';

@Component({
  selector: 'app-recipes-carousel',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    SlickCarouselModule,
    RecipeTileComponent,
  ],
  templateUrl: './recipes-carousel.component.html',
  styleUrl: './recipes-carousel.component.scss', // Ensure 'styleUrls' instead of 'styleUrl'
})
export class RecipesCarouselComponent implements AfterViewInit {
  @Input() recipes: any[] = [];
  @ViewChild('slickModal') slickModal!: SlickCarouselComponent;

  slideConfig = {
    slidesToShow: 2, // The number of slides to show
    slidesToScroll: 1, // Number of slides to scroll at a time
    infinite: true, // Set to false if you want to disable looping
    dots: false, // Enable/disable dots
    centerMode: true, // Enables partial view of next slide
    centerPadding: '50px',
    variableWidth: false, // Adjust the width of the items dynamically
    accessibility: true,
    adaptiveHeight: true,
    responsive: [
      {
        breakpoint: 960, // For screens below 960px
        settings: {
          slidesToShow: 2, // Show 2 slides on medium screens
          slidesToScroll: 1,
          centerMode: true, // Enables partial view of next slide
          centerPadding: '50px', // Center the items
          variableWidth: false, // Adjust the width dynamically
        },
      },
      {
        breakpoint: 768, // For screens below 768px
        settings: {
          slidesToShow: 1, // Show 1 slide on smaller screens
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
