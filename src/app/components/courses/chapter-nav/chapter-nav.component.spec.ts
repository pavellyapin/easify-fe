import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChapterNavComponent } from './chapter-nav.component';

describe('ChapterNavComponent', () => {
  let component: ChapterNavComponent;
  let fixture: ComponentFixture<ChapterNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChapterNavComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChapterNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
