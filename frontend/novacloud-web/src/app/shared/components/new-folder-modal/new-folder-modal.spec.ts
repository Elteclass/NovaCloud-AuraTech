import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewFolderModal } from './new-folder-modal';

describe('NewFolderModal', () => {
  let component: NewFolderModal;
  let fixture: ComponentFixture<NewFolderModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewFolderModal],
    }).compileComponents();

    fixture = TestBed.createComponent(NewFolderModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
