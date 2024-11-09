import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomDayDietNutritionComponent } from './diet-nutrition.component';

describe('CustomDayDietNutritionComponent', () => {
  let component: CustomDayDietNutritionComponent;
  let fixture: ComponentFixture<CustomDayDietNutritionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomDayDietNutritionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomDayDietNutritionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
