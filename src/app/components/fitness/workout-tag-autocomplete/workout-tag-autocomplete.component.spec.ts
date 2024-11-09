import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutTagAutocompleteComponent } from './workout-tag-autocomplete.component';

describe('WorkoutTagAutocompleteComponent', () => {
  let component: WorkoutTagAutocompleteComponent;
  let fixture: ComponentFixture<WorkoutTagAutocompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkoutTagAutocompleteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkoutTagAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
