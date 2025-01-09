import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseTagsAutocompleteComponent } from './course-tags-autocomplete.component';

describe('CourseTagsAutocompleteComponent', () => {
  let component: CourseTagsAutocompleteComponent;
  let fixture: ComponentFixture<CourseTagsAutocompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseTagsAutocompleteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseTagsAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
