import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CloudFile } from '../../../core/models/cloud-file.model';
import { FileListViewComponent } from '../../../shared/components/file-list-view/file-list-view.component';
import { FilesService } from '../../../core/services/http/files.service';

@Component({
  selector: 'app-trash-page',
  imports: [CommonModule, FileListViewComponent],
  templateUrl: './trash-page.html'
})
export class TrashPage implements OnInit {
  trashedFiles: CloudFile[] = [];
  private readonly platformId = inject(PLATFORM_ID);

  constructor(private filesService: FilesService) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.filesService.listFiles('trash').subscribe({
      next: (files) => this.trashedFiles = files,
      error: () => this.trashedFiles = []
    });
  }
}
