import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstructionsContentComponent } from './instructions-content.component';

describe('InstructionsContentComponent', () => {
  let component: InstructionsContentComponent;
  let fixture: ComponentFixture<InstructionsContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstructionsContentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstructionsContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
