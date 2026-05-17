import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CloudFile } from '../../../core/models/cloud-file.model';
import { FileListViewComponent } from '../../../shared/components/file-list-view/file-list-view.component';
import { FilesService } from '../../../core/services/http/files.service';

@Component({
  selector: 'app-starred-page',
  imports: [CommonModule, FileListViewComponent],
  templateUrl: './starred-page.html'
})
export class StarredPage implements OnInit {
  starredFiles: CloudFile[] = [];
  private readonly platformId = inject(PLATFORM_ID);

  constructor(private filesService: FilesService) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.filesService.listFiles('starred').subscribe({
      next: (files) => this.starredFiles = files,
      error: () => this.starredFiles = []
    });
  }
}
