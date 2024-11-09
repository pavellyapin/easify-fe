import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndustryTileComponent } from './industry-tile.component';

describe('IndustryTileComponent', () => {
  let component: IndustryTileComponent;
  let fixture: ComponentFixture<IndustryTileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndustryTileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndustryTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
