import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancialPlanDetailsComponent } from './financial-plan-details.component';

describe('FinancialPlanDetailsComponent', () => {
  let component: FinancialPlanDetailsComponent;
  let fixture: ComponentFixture<FinancialPlanDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinancialPlanDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinancialPlanDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
