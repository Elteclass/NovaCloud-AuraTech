import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrashPage } from './trash-page';

describe('TrashPage', () => {
  let component: TrashPage;
  let fixture: ComponentFixture<TrashPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrashPage],
    }).compileComponents();

    fixture = TestBed.createComponent(TrashPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
