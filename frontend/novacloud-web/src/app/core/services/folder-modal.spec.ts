import { TestBed } from '@angular/core/testing';

import { FolderModal } from './folder-modal';

describe('FolderModal', () => {
  let service: FolderModal;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FolderModal);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
