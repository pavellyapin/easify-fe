import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseChapterComponent } from './course-chapter.component';

describe('CourseChapterComponent', () => {
  let component: CourseChapterComponent;
  let fixture: ComponentFixture<CourseChapterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseChapterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseChapterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
