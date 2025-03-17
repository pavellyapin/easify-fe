import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfolioBreakdownEasifyComponent } from './portfolio-breakdown-easify.component';

describe('PortfolioBreakdownEasifyComponent', () => {
  let component: PortfolioBreakdownEasifyComponent;
  let fixture: ComponentFixture<PortfolioBreakdownEasifyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortfolioBreakdownEasifyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PortfolioBreakdownEasifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
