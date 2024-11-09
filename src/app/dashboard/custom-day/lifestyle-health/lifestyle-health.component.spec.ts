import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomDayLifestyleHealthComponent } from './lifestyle-health.component';

describe('CustomDayLifestyleHealthComponent', () => {
  let component: CustomDayLifestyleHealthComponent;
  let fixture: ComponentFixture<CustomDayLifestyleHealthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomDayLifestyleHealthComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomDayLifestyleHealthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
