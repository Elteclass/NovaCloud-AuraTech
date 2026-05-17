import { Component, OnInit, effect, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { forkJoin } from 'rxjs';
import { CloudFile, CloudFolder, StorageInfo } from '../../../core/models/cloud-file.model';
import { FileListViewComponent } from '../../../shared/components/file-list-view/file-list-view.component';
import { FilesService } from '../../../core/services/http/files.service';
import { FoldersService } from '../../../core/services/http/folders.service';
import { FolderModalService } from '../../../core/services/folder-modal';

@Component({
  selector: 'app-dashboard-page',
  imports: [CommonModule, FileListViewComponent],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss'
})
export class DashboardPage implements OnInit {
  folders: CloudFolder[] = [];
  files: CloudFile[] = [];
  recentFiles: CloudFile[] = [];
  starredFiles: CloudFile[] = [];
  trashedFiles: CloudFile[] = [];
  storageUsage: StorageInfo = { usedGB: 0, totalGB: 0, percentage: 0 };
  isLoading = false;
  private readonly folderModalService = inject(FolderModalService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly refreshFoldersEffect = effect(() => {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.folderModalService.refreshTick();
    this.loadFolders();
  });

  constructor(private filesService: FilesService, private foldersService: FoldersService) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.isLoading = true;
    forkJoin({
      folders: this.foldersService.listFolders(),
      files: this.filesService.listFiles(),
      recentFiles: this.filesService.listFiles('recent'),
      starredFiles: this.filesService.listFiles('starred'),
      trashedFiles: this.filesService.listFiles('trash'),
      storageUsage: this.filesService.getStorageUsage(),
    }).subscribe({
      next: (data) => {
        this.folders = data.folders;
        this.files = data.files;
        this.recentFiles = data.recentFiles;
        this.starredFiles = data.starredFiles;
        this.trashedFiles = data.trashedFiles;
        this.storageUsage = data.storageUsage;
        this.isLoading = false;
      },
      error: () => {
        this.folders = [];
        this.files = [];
        this.recentFiles = [];
        this.starredFiles = [];
        this.trashedFiles = [];
        this.storageUsage = { usedGB: 0, totalGB: 0, percentage: 0 };
        this.isLoading = false;
      }
    });
  }

  private loadFolders(): void {
    this.foldersService.listFolders().subscribe({
      next: (folders) => this.folders = folders,
      error: () => this.folders = []
    });
  }
}
