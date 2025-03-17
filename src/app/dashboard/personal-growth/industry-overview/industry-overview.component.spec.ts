import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndustryOverviewComponent } from './industry-overview.component';

describe('IndustryOverviewComponent', () => {
  let component: IndustryOverviewComponent;
  let fixture: ComponentFixture<IndustryOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndustryOverviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndustryOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
