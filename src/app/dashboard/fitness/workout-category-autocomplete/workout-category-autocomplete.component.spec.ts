import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutCategoryAutocompleteComponent } from './workout-category-autocomplete.component';

describe('WorkoutCategoryAutocompleteComponent', () => {
  let component: WorkoutCategoryAutocompleteComponent;
  let fixture: ComponentFixture<WorkoutCategoryAutocompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkoutCategoryAutocompleteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkoutCategoryAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
