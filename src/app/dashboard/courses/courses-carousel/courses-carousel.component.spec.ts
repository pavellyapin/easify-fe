import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoursesCarouselComponent } from './courses-carousel.component';

describe('CoursesCarouselComponent', () => {
  let component: CoursesCarouselComponent;
  let fixture: ComponentFixture<CoursesCarouselComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoursesCarouselComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoursesCarouselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
