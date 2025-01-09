import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutOverviewComponent } from './workout-overview.component';

describe('WorkoutOverviewComponent', () => {
  let component: WorkoutOverviewComponent;
  let fixture: ComponentFixture<WorkoutOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkoutOverviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkoutOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
