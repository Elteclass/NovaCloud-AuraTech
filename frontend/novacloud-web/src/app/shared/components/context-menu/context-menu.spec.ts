import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContextMenu } from './context-menu';

describe('ContextMenu', () => {
  let component: ContextMenu;
  let fixture: ComponentFixture<ContextMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContextMenu],
    }).compileComponents();

    fixture = TestBed.createComponent(ContextMenu);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
