import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeSearchBoxComponent } from './recipe-search-box.component';

describe('RecipeSearchBoxComponent', () => {
  let component: RecipeSearchBoxComponent;
  let fixture: ComponentFixture<RecipeSearchBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeSearchBoxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecipeSearchBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
