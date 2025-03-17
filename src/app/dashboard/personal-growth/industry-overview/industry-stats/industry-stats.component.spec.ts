import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndustryStatsComponent } from './industry-stats.component';

describe('IndustryStatsComponent', () => {
  let component: IndustryStatsComponent;
  let fixture: ComponentFixture<IndustryStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndustryStatsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndustryStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
