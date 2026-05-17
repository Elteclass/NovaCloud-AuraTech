import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CloudFile } from '../../../core/models/cloud-file.model';
import { FileListViewComponent } from '../../../shared/components/file-list-view/file-list-view.component';
import { FilesService } from '../../../core/services/http/files.service';

@Component({
  selector: 'app-recent-page',
  imports: [CommonModule, FileListViewComponent],
  templateUrl: './recent-page.html'
})
export class RecentPage implements OnInit {
  recentFiles: CloudFile[] = [];

  constructor(private filesService: FilesService) {}

  ngOnInit(): void {
    this.filesService.listFiles('recent').subscribe({
      next: (files) => this.recentFiles = files,
      error: () => this.recentFiles = []
    });
  }
}
