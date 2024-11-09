import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopicLoaderComponent } from './topic-loader.component';

describe('TopicLoaderComponent', () => {
  let component: TopicLoaderComponent;
  let fixture: ComponentFixture<TopicLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopicLoaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopicLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
