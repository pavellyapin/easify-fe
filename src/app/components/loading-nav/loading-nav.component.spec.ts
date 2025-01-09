import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingNavComponent } from './loading-nav.component';

describe('LoadingNavComponent', () => {
  let component: LoadingNavComponent;
  let fixture: ComponentFixture<LoadingNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingNavComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadingNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
