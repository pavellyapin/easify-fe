import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancialPlanTileComponent } from './financial-plan-tile.component';

describe('FinancialPlanTileComponent', () => {
  let component: FinancialPlanTileComponent;
  let fixture: ComponentFixture<FinancialPlanTileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinancialPlanTileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinancialPlanTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
