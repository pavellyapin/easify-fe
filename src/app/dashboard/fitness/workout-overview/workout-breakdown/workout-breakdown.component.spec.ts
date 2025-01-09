import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutBreakdownComponent } from './workout-breakdown.component';

describe('WorkoutBreakdownComponent', () => {
  let component: WorkoutBreakdownComponent;
  let fixture: ComponentFixture<WorkoutBreakdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkoutBreakdownComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkoutBreakdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
