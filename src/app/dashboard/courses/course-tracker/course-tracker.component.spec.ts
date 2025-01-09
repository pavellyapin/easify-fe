import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseTrackerComponent } from './course-tracker.component';

describe('CourseTrackerComponent', () => {
  let component: CourseTrackerComponent;
  let fixture: ComponentFixture<CourseTrackerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseTrackerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseTrackerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
