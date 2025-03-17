/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { CapitalizePipe } from '@services/capitalize.pipe';
import { setDashboardLoading } from '@store/loader/loading.actions';

@Component({
  selector: 'app-recipe-tile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatChipsModule,
    MatButtonModule,
    MatProgressBar,
    MatIconModule,
    MatTooltipModule,
    CapitalizePipe,
  ],
  templateUrl: './recipe-tile.component.html',
  styleUrl: './recipe-tile.component.scss', // Ensure the correct property
})
export class RecipeTileComponent implements AfterViewInit, OnChanges {
  @Input() recipe!: any; // Replace with a proper RecipeItem type if available
  @Input() manualLoad = false; // Flag to handle manual loading (e.g., in carousels)

  @ViewChild('image', { static: false }) imageElement!: ElementRef;
  imageSrc = '';
  isImageLoading = true;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private store: Store,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.manualLoad && changes['recipe'] && this.recipe) {
      this.imageSrc = this.recipe.image;
      this.isImageLoading = false; // No loading state for manual load
    }
  }

  ngAfterViewInit(): void {
    if (!this.manualLoad) {
      this.lazyLoadImage(); // Lazy load only when manualLoad is false
    } else {
      this.onImageLoad(); // Immediately display the image
    }
  }

  lazyLoadImage(): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.imageSrc = this.recipe.image; // Set the image URL only when it's in view
          observer.disconnect(); // Stop observing once the image is loaded
        }
      });
    });

    observer.observe(this.imageElement.nativeElement);
  }

  onImageLoad(): void {
    this.isImageLoading = false; // Hide the skeleton loader once the image is loaded
    this.cdr.detectChanges(); // Trigger manual change detection
  }

  getLevelIcon(level: string): string {
    switch (level.toLowerCase()) {
      case 'beginner':
        return 'beginner'; // Name of the icon for Beginner
      case 'intermediate':
        return 'intermediate'; // Name of the icon for Intermediate
      case 'advanced':
        return 'advanced'; // Name of the icon for Advanced
      default:
        return 'intermediate'; // Fallback icon
    }
  }

  startRecipe(recipeId: string) {
    this.store.dispatch(setDashboardLoading({ isLoading: true }));
    try {
      setTimeout(() => {
        this.router.navigate(['dashboard/recipe/', recipeId]).then(() => {
          this.store.dispatch(setDashboardLoading({ isLoading: false }));
        });
      }, 200);
    } catch (error: any) {
      console.error('Failed to start recipe:', error);
    }
  }
}
