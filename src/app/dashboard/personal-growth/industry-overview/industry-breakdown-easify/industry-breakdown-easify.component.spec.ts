import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndustryBreakdownEasifyComponent } from './industry-breakdown-easify.component';

describe('IndustryBreakdownEasifyComponent', () => {
  let component: IndustryBreakdownEasifyComponent;
  let fixture: ComponentFixture<IndustryBreakdownEasifyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndustryBreakdownEasifyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndustryBreakdownEasifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
