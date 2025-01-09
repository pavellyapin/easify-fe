import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RefreshDayComponent } from './refresh-day.component';

describe('RefreshDayComponent', () => {
  let component: RefreshDayComponent;
  let fixture: ComponentFixture<RefreshDayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RefreshDayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RefreshDayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
