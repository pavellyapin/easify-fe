import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllWorkoutsComponent } from './all-workouts.component';

describe('AllWorkoutsComponent', () => {
  let component: AllWorkoutsComponent;
  let fixture: ComponentFixture<AllWorkoutsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllWorkoutsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllWorkoutsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
