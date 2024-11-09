import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomDayComponent } from './custom-day.component';

describe('CustomDayComponent', () => {
  let component: CustomDayComponent;
  let fixture: ComponentFixture<CustomDayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomDayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomDayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
