import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EasifyWorkoutInstructionComponent } from './easify-workout-instruction.component';

describe('EasifyInstructionComponent', () => {
  let component: EasifyWorkoutInstructionComponent;
  let fixture: ComponentFixture<EasifyWorkoutInstructionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EasifyWorkoutInstructionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EasifyWorkoutInstructionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
