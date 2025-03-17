/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectStartedCourse } from '@store/started-course/started-course.selectors';
import { selectStartedIndustry } from '@store/started-growth/started-growth.selectors';
import { selectStartedPortfolio } from '@store/started-portfolio/started-portfolio.selectors';
import { selectStartedRecipe } from '@store/started-recipe/started-recipe.selectors';
import { selectStartedWorkout } from '@store/started-workout/started-workout.selectors';
import { combineLatest } from 'rxjs';
import { filter, map, switchMap, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class TitleService {
  constructor(
    private title: Title,
    private meta: Meta,
    private router: Router,
    private route: ActivatedRoute,
    private store: Store,
  ) {}

  init(): void {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        switchMap(() => {
          let child = this.route.firstChild;
          while (child?.firstChild) {
            child = child.firstChild;
          }

          // Extract static title and description from route metadata
          const routeTitle = child?.snapshot.data['title'];
          const metaDescription =
            child?.snapshot.data['description'] || 'Discover more with Easify.';

          return this.getDynamicTitleAndMeta(routeTitle, metaDescription);
        }),
      )
      .subscribe(({ title, description }) => {
        this.setTitle(title);
        this.setMetaTags(title, description);
      });
  }

  /**
   * Fetches dynamic titles from started portfolio, course, recipe, workout, or industry.
   */
  private getDynamicTitleAndMeta(routeTitle: string, metaDescription: string) {
    return combineLatest([
      this.store.select(selectStartedPortfolio).pipe(take(1)),
      this.store.select(selectStartedCourse).pipe(take(1)),
      this.store.select(selectStartedRecipe).pipe(take(1)),
      this.store.select(selectStartedWorkout).pipe(take(1)),
      this.store.select(selectStartedIndustry).pipe(take(1)),
    ]).pipe(
      map(([portfolio, course, recipe, workout, industry]) => {
        if (routeTitle === 'Portfolio Overview' && portfolio?.portfolio?.name) {
          return {
            title: `${portfolio.portfolio.name} Overview`,
            description: metaDescription,
          };
        }

        if (routeTitle === 'Course Overview' && course?.course.name) {
          return {
            title: `${course.course.name} Course`,
            description: metaDescription,
          };
        }

        if (routeTitle === 'Recipe Overview' && recipe?.recipe.name) {
          return {
            title: `${recipe.recipe.name} Recipe`,
            description: metaDescription,
          };
        }

        if (routeTitle === 'Workout Overview' && workout?.workout.name) {
          return {
            title: `${workout.workout.name} Workout`,
            description: metaDescription,
          };
        }

        if (routeTitle === 'Industry Overview' && industry?.industry.name) {
          return {
            title: `${industry.industry.name} Industry`,
            description: metaDescription,
          };
        }

        return { title: routeTitle || 'Easify', description: metaDescription };
      }),
    );
  }

  setTitle(newTitle: string): void {
    this.title.setTitle(`${newTitle} | Easify`);
  }

  setMetaTags(title: string, description: string): void {
    const currentUrl = this.router.url;

    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({
      property: 'og:url',
      content: `https://easify.ca${currentUrl}`,
    });
  }
}
