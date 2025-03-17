import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfolioStatsComponent } from './portfolio-stats.component';

describe('PortfolioStatsComponent', () => {
  let component: PortfolioStatsComponent;
  let fixture: ComponentFixture<PortfolioStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortfolioStatsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PortfolioStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
