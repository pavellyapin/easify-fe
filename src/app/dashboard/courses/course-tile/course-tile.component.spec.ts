import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseTileComponent } from './course-tile.component';

describe('CourseTileComponent', () => {
  let component: CourseTileComponent;
  let fixture: ComponentFixture<CourseTileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseTileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
