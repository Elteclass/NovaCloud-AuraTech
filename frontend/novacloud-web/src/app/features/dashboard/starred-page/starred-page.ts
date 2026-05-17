import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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

  constructor(private filesService: FilesService) {}

  ngOnInit(): void {
    this.filesService.listFiles('starred').subscribe({
      next: (files) => this.starredFiles = files,
      error: () => this.starredFiles = []
    });
  }
}