import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoursesSearchBoxComponent } from './courses-search-box.component';

describe('CoursesSearchBoxComponent', () => {
  let component: CoursesSearchBoxComponent;
  let fixture: ComponentFixture<CoursesSearchBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoursesSearchBoxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoursesSearchBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
