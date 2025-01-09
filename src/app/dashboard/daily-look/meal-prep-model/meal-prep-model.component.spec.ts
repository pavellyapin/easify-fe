import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MealPrepModelComponent } from './meal-prep-model.component';

describe('MealPrepModelComponent', () => {
  let component: MealPrepModelComponent;
  let fixture: ComponentFixture<MealPrepModelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MealPrepModelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MealPrepModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
