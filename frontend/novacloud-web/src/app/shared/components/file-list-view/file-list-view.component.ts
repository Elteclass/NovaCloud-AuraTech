import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CloudFile } from '../../../core/models/cloud-file.model';
import { FileCard } from '../file-card/file-card';
import { FileBrowserService } from '../../../core/services/file-browser.service';
import { FilePreviewService } from '../../../core/services/file-preview.service';

@Component({
  selector: 'app-file-list-view',
  standalone: true,
  imports: [CommonModule, FileCard],
  templateUrl: './file-list-view.component.html',
})
export class FileListViewComponent {
  @Input({ required: true }) files: CloudFile[] = [];
  @Input() isTrash = false;

  fileBrowserService = inject(FileBrowserService);
  filePreviewService = inject(FilePreviewService);

  get filteredFiles(): CloudFile[] {
    return this.fileBrowserService.filterFiles(this.files);
  }

  openPreview(file: CloudFile): void {
    this.filePreviewService.open(file);
  }
}
