import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CuisineAutocompleteComponent } from './cuisine-autocomplete.component';

describe('CuisineAutocompleteComponent', () => {
  let component: CuisineAutocompleteComponent;
  let fixture: ComponentFixture<CuisineAutocompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CuisineAutocompleteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CuisineAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
