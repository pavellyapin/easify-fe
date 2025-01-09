import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeSearchResultsComponent } from './recipe-search-results.component';

describe('RecipeSearchResultsComponent', () => {
  let component: RecipeSearchResultsComponent;
  let fixture: ComponentFixture<RecipeSearchResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeSearchResultsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecipeSearchResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
