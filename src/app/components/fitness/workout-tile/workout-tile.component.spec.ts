import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutTileComponent } from './workout-tile.component';

describe('WorkoutTileComponent', () => {
  let component: WorkoutTileComponent;
  let fixture: ComponentFixture<WorkoutTileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkoutTileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkoutTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
