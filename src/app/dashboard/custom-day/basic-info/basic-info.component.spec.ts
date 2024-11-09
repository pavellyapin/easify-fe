import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomDayBasicInfoComponent } from './basic-info.component';

describe('CustomDayBasicInfoComponent', () => {
  let component: CustomDayBasicInfoComponent;
  let fixture: ComponentFixture<CustomDayBasicInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomDayBasicInfoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomDayBasicInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
