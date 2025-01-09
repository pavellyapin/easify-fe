import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IngredientsAutocompleteComponent } from './ingredients-autocomplete.component';

describe('IngredientsAutocompleteComponent', () => {
  let component: IngredientsAutocompleteComponent;
  let fixture: ComponentFixture<IngredientsAutocompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IngredientsAutocompleteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IngredientsAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
