import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfolioBreakdownContentComponent } from './portfolio-breakdown-content.component';

describe('PortfolioBreakdownContentComponent', () => {
  let component: PortfolioBreakdownContentComponent;
  let fixture: ComponentFixture<PortfolioBreakdownContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortfolioBreakdownContentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PortfolioBreakdownContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
