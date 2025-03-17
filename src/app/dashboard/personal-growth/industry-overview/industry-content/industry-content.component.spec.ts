import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndustryContentComponent } from './industry-content.component';

describe('IndustryContentComponent', () => {
  let component: IndustryContentComponent;
  let fixture: ComponentFixture<IndustryContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndustryContentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndustryContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
