import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeBreakdownComponent } from './recipe-breakdown.component';

describe('RecipeBreakdownComponent', () => {
  let component: RecipeBreakdownComponent;
  let fixture: ComponentFixture<RecipeBreakdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeBreakdownComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecipeBreakdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
