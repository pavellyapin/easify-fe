import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfolioNavComponent } from './portfolio-nav.component';

describe('PortfolioNavComponent', () => {
  let component: PortfolioNavComponent;
  let fixture: ComponentFixture<PortfolioNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortfolioNavComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PortfolioNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
