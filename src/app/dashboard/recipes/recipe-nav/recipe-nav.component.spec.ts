import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeNavComponent } from './recipe-nav.component';

describe('RecipeNavComponent', () => {
  let component: RecipeNavComponent;
  let fixture: ComponentFixture<RecipeNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeNavComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecipeNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
