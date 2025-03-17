import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllIndustriesComponent } from './all-industries.component';

describe('AllIndustriesComponent', () => {
  let component: AllIndustriesComponent;
  let fixture: ComponentFixture<AllIndustriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllIndustriesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllIndustriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
