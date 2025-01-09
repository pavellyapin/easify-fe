import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChapterTableOfContentComponent } from './chapter-table-of-content.component';

describe('ChapterTableOfContentComponent', () => {
  let component: ChapterTableOfContentComponent;
  let fixture: ComponentFixture<ChapterTableOfContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChapterTableOfContentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChapterTableOfContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
