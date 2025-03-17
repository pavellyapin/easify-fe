import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndustryBreakdownComponent } from './industry-breakdown.component';

describe('IndustryBreakdownComponent', () => {
  let component: IndustryBreakdownComponent;
  let fixture: ComponentFixture<IndustryBreakdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndustryBreakdownComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndustryBreakdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
