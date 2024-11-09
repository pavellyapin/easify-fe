import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateAvatarComponent } from './generate-avatar.component';

describe('GenerateAvatarComponent', () => {
  let component: GenerateAvatarComponent;
  let fixture: ComponentFixture<GenerateAvatarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerateAvatarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerateAvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
