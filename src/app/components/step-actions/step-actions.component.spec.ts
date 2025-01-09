import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomDayStepActionsComponent } from './step-actions.component';

describe('CustomDayStepActionsComponent', () => {
  let component: CustomDayStepActionsComponent;
  let fixture: ComponentFixture<CustomDayStepActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomDayStepActionsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomDayStepActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
