import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DietNutritionComponent } from './diet-nutrition.component';

describe('DietNutritionComponent', () => {
  let component: DietNutritionComponent;
  let fixture: ComponentFixture<DietNutritionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DietNutritionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DietNutritionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
