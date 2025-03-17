import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndustryIntroComponent } from './industry-intro.component';

describe('IndustryIntroComponent', () => {
  let component: IndustryIntroComponent;
  let fixture: ComponentFixture<IndustryIntroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndustryIntroComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndustryIntroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
