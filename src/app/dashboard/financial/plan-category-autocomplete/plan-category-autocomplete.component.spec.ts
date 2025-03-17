import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanCategoryAutocompleteComponent } from './plan-category-autocomplete.component';

describe('PlanCategoryAutocompleteComponent', () => {
  let component: PlanCategoryAutocompleteComponent;
  let fixture: ComponentFixture<PlanCategoryAutocompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanCategoryAutocompleteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanCategoryAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
