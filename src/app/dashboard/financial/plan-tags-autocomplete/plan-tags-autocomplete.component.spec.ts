import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanTagsAutocompleteComponent } from './plan-tags-autocomplete.component';

describe('PlanTagsAutocompleteComponent', () => {
  let component: PlanTagsAutocompleteComponent;
  let fixture: ComponentFixture<PlanTagsAutocompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanTagsAutocompleteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanTagsAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
