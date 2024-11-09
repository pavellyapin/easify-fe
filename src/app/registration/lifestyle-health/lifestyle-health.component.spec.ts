import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LifestyleHealthComponent } from './lifestyle-health.component';

describe('LifestyleHealthComponent', () => {
  let component: LifestyleHealthComponent;
  let fixture: ComponentFixture<LifestyleHealthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LifestyleHealthComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LifestyleHealthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
