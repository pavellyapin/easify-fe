import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutSearchResultsComponent } from './workout-search-results.component';

describe('WorkoutSearchResultsComponent', () => {
  let component: WorkoutSearchResultsComponent;
  let fixture: ComponentFixture<WorkoutSearchResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkoutSearchResultsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkoutSearchResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
