import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfoliosCarouselComponent } from './portfolios-carousel.component';

describe('PortfoliosCarouselComponent', () => {
  let component: PortfoliosCarouselComponent;
  let fixture: ComponentFixture<PortfoliosCarouselComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortfoliosCarouselComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PortfoliosCarouselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
