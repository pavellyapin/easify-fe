import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyLookComponent } from './daily-look.component';

describe('DailyLookComponent', () => {
  let component: DailyLookComponent;
  let fixture: ComponentFixture<DailyLookComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailyLookComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DailyLookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
