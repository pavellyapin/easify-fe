import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfoliosSearchResultsComponent } from './portfolios-search-results.component';

describe('PortfoliosSearchResultsComponent', () => {
  let component: PortfoliosSearchResultsComponent;
  let fixture: ComponentFixture<PortfoliosSearchResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortfoliosSearchResultsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PortfoliosSearchResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
