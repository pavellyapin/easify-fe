import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EasifyInstructionComponent } from './easify-instruction.component';

describe('EasifyInstructionComponent', () => {
  let component: EasifyInstructionComponent;
  let fixture: ComponentFixture<EasifyInstructionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EasifyInstructionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EasifyInstructionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
