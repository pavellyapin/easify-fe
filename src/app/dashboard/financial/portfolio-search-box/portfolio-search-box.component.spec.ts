import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfolioSearchBoxComponent } from './portfolio-search-box.component';

describe('PortfolioSearchBoxComponent', () => {
  let component: PortfolioSearchBoxComponent;
  let fixture: ComponentFixture<PortfolioSearchBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortfolioSearchBoxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PortfolioSearchBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
