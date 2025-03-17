import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutSearchBoxComponent } from './workout-search-box.component';

describe('WorkoutSearchBoxComponent', () => {
  let component: WorkoutSearchBoxComponent;
  let fixture: ComponentFixture<WorkoutSearchBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkoutSearchBoxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkoutSearchBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
