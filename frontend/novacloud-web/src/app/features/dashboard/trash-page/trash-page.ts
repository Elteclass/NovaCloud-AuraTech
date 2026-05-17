import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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

  constructor(private filesService: FilesService) {}

  ngOnInit(): void {
    this.filesService.listFiles('trash').subscribe({
      next: (files) => this.trashedFiles = files,
      error: () => this.trashedFiles = []
    });
  }
}