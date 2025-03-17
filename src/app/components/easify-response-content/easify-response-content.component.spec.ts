import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EasifyResponseContentComponent } from './easify-response-content.component';

describe('EasifyResponseContentComponent', () => {
  let component: EasifyResponseContentComponent;
  let fixture: ComponentFixture<EasifyResponseContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EasifyResponseContentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EasifyResponseContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
