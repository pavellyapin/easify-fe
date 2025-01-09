import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeByIngredientsComponent } from './recipe-by-ingredients.component';

describe('RecipeByIngredientsComponent', () => {
  let component: RecipeByIngredientsComponent;
  let fixture: ComponentFixture<RecipeByIngredientsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeByIngredientsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecipeByIngredientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
