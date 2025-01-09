import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutIntroComponent } from './workout-intro.component';

describe('WorkoutIntroComponent', () => {
  let component: WorkoutIntroComponent;
  let fixture: ComponentFixture<WorkoutIntroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkoutIntroComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkoutIntroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
