import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiniResumeComponent } from './mini-resume.component';

describe('MiniResumeComponent', () => {
  let component: MiniResumeComponent;
  let fixture: ComponentFixture<MiniResumeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiniResumeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MiniResumeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
