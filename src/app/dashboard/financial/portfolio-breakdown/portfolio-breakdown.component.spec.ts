import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfolioBreakdownComponent } from './portfolio-breakdown.component';

describe('PortfolioBreakdownComponent', () => {
  let component: PortfolioBreakdownComponent;
  let fixture: ComponentFixture<PortfolioBreakdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortfolioBreakdownComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PortfolioBreakdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
