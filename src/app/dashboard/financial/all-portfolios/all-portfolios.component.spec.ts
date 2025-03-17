import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllPortfoliosComponent } from './all-portfolios.component';

describe('AllPortfoliosComponent', () => {
  let component: AllPortfoliosComponent;
  let fixture: ComponentFixture<AllPortfoliosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllPortfoliosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllPortfoliosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
