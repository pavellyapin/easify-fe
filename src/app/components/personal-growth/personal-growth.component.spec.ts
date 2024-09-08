import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalGrowthComponent } from './personal-growth.component';

describe('PersonalGrowthComponent', () => {
  let component: PersonalGrowthComponent;
  let fixture: ComponentFixture<PersonalGrowthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonalGrowthComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonalGrowthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
