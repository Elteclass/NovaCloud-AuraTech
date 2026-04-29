import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadPage } from './upload-page';

describe('UploadPage', () => {
  let component: UploadPage;
  let fixture: ComponentFixture<UploadPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadPage],
    }).compileComponents();

    fixture = TestBed.createComponent(UploadPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
