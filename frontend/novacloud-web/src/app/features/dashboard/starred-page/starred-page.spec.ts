import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StarredPage } from './starred-page';

describe('StarredPage', () => {
  let component: StarredPage;
  let fixture: ComponentFixture<StarredPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StarredPage],
    }).compileComponents();

    fixture = TestBed.createComponent(StarredPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
