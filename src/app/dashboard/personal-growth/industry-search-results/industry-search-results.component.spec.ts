import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndustrySearchResultsComponent } from './industry-search-results.component';

describe('IndustrySearchResultsComponent', () => {
  let component: IndustrySearchResultsComponent;
  let fixture: ComponentFixture<IndustrySearchResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndustrySearchResultsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndustrySearchResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
