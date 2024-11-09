import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseCategoryAutocompleteComponent } from './course-category-autocomplete.component';

describe('CourseCategoryAutocompleteComponent', () => {
  let component: CourseCategoryAutocompleteComponent;
  let fixture: ComponentFixture<CourseCategoryAutocompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseCategoryAutocompleteComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CourseCategoryAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
