import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomDayWorkSkillsComponent } from './work-skills.component';

describe('CustomDayWorkSkillsComponent', () => {
  let component: CustomDayWorkSkillsComponent;
  let fixture: ComponentFixture<CustomDayWorkSkillsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomDayWorkSkillsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomDayWorkSkillsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
