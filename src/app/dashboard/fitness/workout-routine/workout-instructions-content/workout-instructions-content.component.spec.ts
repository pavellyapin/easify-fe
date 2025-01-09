import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutInstructionsContentComponent } from './workout-instructions-content.component';

describe('InstructionsContentComponent', () => {
  let component: WorkoutInstructionsContentComponent;
  let fixture: ComponentFixture<WorkoutInstructionsContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkoutInstructionsContentComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkoutInstructionsContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
