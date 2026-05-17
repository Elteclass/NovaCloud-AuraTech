import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { UploadPage } from './upload-page';
import { FilesService } from '../../../core/services/http/files.service';
import { UploadsService } from '../../../core/services/http/uploads.service';

describe('UploadPage', () => {
  let component: UploadPage;
  let fixture: ComponentFixture<UploadPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadPage],
      providers: [
        {
          provide: FilesService,
          useValue: {
            listFiles: () => of([]),
          },
        },
        {
          provide: UploadsService,
          useValue: {
            uploadFile: () => ({
              promise: Promise.resolve({
                id: '1',
                name: 'sample.txt',
                size: '1.0 KB',
                type: 'pdf',
                contentType: 'text/plain',
                tags: [],
                isStarred: false,
                status: 'ACTIVE',
                uploadedAt: new Date().toISOString(),
                trashedAt: null,
              }),
              cancel: () => {},
            }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UploadPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
