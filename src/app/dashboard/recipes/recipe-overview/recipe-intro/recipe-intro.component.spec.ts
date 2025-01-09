import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeIntroComponent } from './recipe-intro.component';

describe('RecipeIntroComponent', () => {
  let component: RecipeIntroComponent;
  let fixture: ComponentFixture<RecipeIntroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeIntroComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecipeIntroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
