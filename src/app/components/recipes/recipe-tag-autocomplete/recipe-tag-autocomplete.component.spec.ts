import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeTagAutocompleteComponent } from './recipe-tag-autocomplete.component';

describe('RecipeTagAutocompleteComponent', () => {
  let component: RecipeTagAutocompleteComponent;
  let fixture: ComponentFixture<RecipeTagAutocompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeTagAutocompleteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecipeTagAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
