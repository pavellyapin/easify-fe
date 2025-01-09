import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutsCarouselComponent } from './workouts-carousel.component';

describe('WorkoutsCarouselComponent', () => {
  let component: WorkoutsCarouselComponent;
  let fixture: ComponentFixture<WorkoutsCarouselComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkoutsCarouselComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkoutsCarouselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
