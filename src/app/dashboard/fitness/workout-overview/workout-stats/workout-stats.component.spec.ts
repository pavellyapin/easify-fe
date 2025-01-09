import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutStatsComponent } from './workout-stats.component';

describe('WorkoutStatsComponent', () => {
  let component: WorkoutStatsComponent;
  let fixture: ComponentFixture<WorkoutStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkoutStatsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkoutStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
