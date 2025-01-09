import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EasifyTopicComponent } from './easify-topic.component';

describe('EasifyTopicComponent', () => {
  let component: EasifyTopicComponent;
  let fixture: ComponentFixture<EasifyTopicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EasifyTopicComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EasifyTopicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
