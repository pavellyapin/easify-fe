/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, Input, QueryList, ViewChildren } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { CourseTileComponent } from '../course-tile/course-tile.component';

@Component({
  selector: 'app-courses-carousel',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    SlickCarouselModule,
    CourseTileComponent,
  ],
  templateUrl: './courses-carousel.component.html',
  styleUrl: './courses-carousel.component.scss', // Ensure 'styleUrls' instead of 'styleUrl'
})
export class CoursesCarouselComponent {
  @Input() courses: any[] = []; // Input the list of courses
  @ViewChildren(CourseTileComponent)
  courseTiles!: QueryList<CourseTileComponent>;

  slideConfig = {
    slidesToShow: 2, // The number of slides to show
    slidesToScroll: 1, // Number of slides to scroll at a time
    infinite: true, // Set to false if you want to disable looping
    dots: false, // Enable/disable dots
    centerMode: true, // Enables partial view of next slide
    centerPadding: '50px',
    variableWidth: false, // Adjust the width of the items dynamically
    responsive: [
      {
        breakpoint: 960, // For screens below 768px
        settings: {
          slidesToShow: 2, // Show only 1 slide at a time on smaller screens
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
}
