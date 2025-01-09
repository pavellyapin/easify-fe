import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutNavComponent } from './workout-nav.component';

describe('WorkoutNavComponent', () => {
  let component: WorkoutNavComponent;
  let fixture: ComponentFixture<WorkoutNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkoutNavComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkoutNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
