import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuggestedActionComponent } from './suggested-action.component';

describe('SuggestedActionComponent', () => {
  let component: SuggestedActionComponent;
  let fixture: ComponentFixture<SuggestedActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuggestedActionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SuggestedActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
