import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndustrySearchBoxComponent } from './industry-search-box.component';

describe('IndustrySearchBoxComponent', () => {
  let component: IndustrySearchBoxComponent;
  let fixture: ComponentFixture<IndustrySearchBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndustrySearchBoxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndustrySearchBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
