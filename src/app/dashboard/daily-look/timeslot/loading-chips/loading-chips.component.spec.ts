import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingChipsComponent } from './loading-chips.component';

describe('LoadingChipsComponent', () => {
  let component: LoadingChipsComponent;
  let fixture: ComponentFixture<LoadingChipsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingChipsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadingChipsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
