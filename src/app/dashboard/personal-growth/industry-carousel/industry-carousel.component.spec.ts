import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndustryCarouselComponent } from './industry-carousel.component';

describe('IndustryCarouselComponent', () => {
  let component: IndustryCarouselComponent;
  let fixture: ComponentFixture<IndustryCarouselComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndustryCarouselComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndustryCarouselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
