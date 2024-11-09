import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndustriesAutocompleteComponent } from './industries-autocomplete.component';

describe('IndustriesAutocompleteComponent', () => {
  let component: IndustriesAutocompleteComponent;
  let fixture: ComponentFixture<IndustriesAutocompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndustriesAutocompleteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndustriesAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
