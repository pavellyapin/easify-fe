import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleStatsComponent } from './schedule-stats.component';

describe('ScheduleStatsComponent', () => {
  let component: ScheduleStatsComponent;
  let fixture: ComponentFixture<ScheduleStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScheduleStatsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScheduleStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
