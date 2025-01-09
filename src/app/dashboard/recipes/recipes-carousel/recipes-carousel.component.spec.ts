import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipesCarouselComponent } from './recipes-carousel.component';

describe('RecipesCarouselComponent', () => {
  let component: RecipesCarouselComponent;
  let fixture: ComponentFixture<RecipesCarouselComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipesCarouselComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecipesCarouselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
