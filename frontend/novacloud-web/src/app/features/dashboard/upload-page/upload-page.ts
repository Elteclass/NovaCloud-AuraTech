import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FileListViewComponent } from '../../../shared/components/file-list-view/file-list-view.component';
import { FilesService } from '../../../core/services/http/files.service';
import { UploadedFileResponse, UploadHandle, UploadsService } from '../../../core/services/http/uploads.service';
import { CloudFile } from '../../../core/models/cloud-file.model';

type UploadStatus = 'queued' | 'uploading' | 'saving' | 'completed' | 'error' | 'cancelled';

interface UploadQueueItem {
  id: string;
  file: File;
  name: string;
  sizeLabel: string;
  progress: number;
  status: UploadStatus;
  message: string;
  icon: string;
  iconBgClass: string;
  iconTextClass: string;
  progressBarClass: string;
  error?: string;
}

interface FileVisualMeta {
  icon: string;
  iconBgClass: string;
  iconTextClass: string;
  progressBarClass: string;
}

@Component({
  selector: 'app-upload-page',
  standalone: true,
  imports: [CommonModule, FileListViewComponent],
  templateUrl: './upload-page.html',
})
export class UploadPage implements OnInit {
  readonly maxFileSizeBytes = 100 * 1024 * 1024;
  private readonly platformId = inject(PLATFORM_ID);

  uploadTasks: UploadQueueItem[] = [];
  recentFiles: CloudFile[] = [];
  isDragging = false;
  isLoadingRecentFiles = false;
  bannerMessage = '';
  bannerState: 'idle' | 'success' | 'error' = 'idle';

  private readonly activeUploads = new Map<string, UploadHandle>();

  constructor(
    private readonly uploadsService: UploadsService,
    private readonly filesService: FilesService
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.loadRecentFiles();
  }

  get queuedCount(): number {
    return this.uploadTasks.filter(task => task.status === 'queued' || task.status === 'uploading' || task.status === 'saving').length;
  }

  get completedCount(): number {
    return this.uploadTasks.filter(task => task.status === 'completed').length;
  }

  get failedCount(): number {
    return this.uploadTasks.filter(task => task.status === 'error' || task.status === 'cancelled').length;
  }

  get uploadedBytes(): number {
    return this.uploadTasks
      .filter(task => task.status === 'completed')
      .reduce((total, task) => total + task.file.size, 0);
  }

  get uploadedBytesLabel(): string {
    return this.formatBytes(this.uploadedBytes);
  }

  openFilePicker(input: HTMLInputElement): void {
    input.click();
  }

  onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = '';
    this.enqueueFiles(files);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    const files = Array.from(event.dataTransfer?.files ?? []);
    this.enqueueFiles(files);
  }

  retryUpload(task: UploadQueueItem): void {
    if (task.status === 'uploading' || task.status === 'saving') {
      return;
    }

    task.progress = 0;
    task.error = undefined;
    task.message = 'Preparing upload';
    task.status = 'queued';
    this.startUpload(task);
  }

  cancelUpload(task: UploadQueueItem): void {
    const handle = this.activeUploads.get(task.id);
    if (handle) {
      handle.cancel();
    }

    task.status = 'cancelled';
    task.message = 'Upload cancelled';
    task.progress = 0;
    this.activeUploads.delete(task.id);
    this.setBanner('Archivo cancelado.', 'error');
  }

  removeTask(task: UploadQueueItem): void {
    this.cancelUpload(task);
    this.uploadTasks = this.uploadTasks.filter(item => item.id !== task.id);
  }

  refreshRecentFiles(): void {
    this.loadRecentFiles();
  }

  trackByTaskId(_: number, task: UploadQueueItem): string {
    return task.id;
  }

  private enqueueFiles(files: File[]): void {
    const validFiles: File[] = [];
    const rejectedFiles: string[] = [];

    for (const file of files) {
      if (file.size > this.maxFileSizeBytes) {
        rejectedFiles.push(`${file.name} exceeds the 100 MB limit`);
        continue;
      }

      validFiles.push(file);
    }

    if (rejectedFiles.length > 0) {
      this.setBanner(rejectedFiles[0], 'error');
    }

    if (validFiles.length === 0) {
      return;
    }

    const newTasks = validFiles.map(file => this.createTask(file));
    this.uploadTasks = [...newTasks, ...this.uploadTasks];

    for (const task of newTasks) {
      this.startUpload(task);
    }
  }

  private createTask(file: File): UploadQueueItem {
    const meta = this.getVisualMeta(file);

    return {
      id: this.createTaskId(file),
      file,
      name: file.name,
      sizeLabel: this.formatBytes(file.size),
      progress: 0,
      status: 'queued',
      message: 'Ready to upload',
      icon: meta.icon,
      iconBgClass: meta.iconBgClass,
      iconTextClass: meta.iconTextClass,
      progressBarClass: meta.progressBarClass
    };
  }

  private startUpload(task: UploadQueueItem): void {
    task.status = 'uploading';
    task.message = 'Uploading file';
    task.progress = 0;

    const handle = this.uploadsService.uploadFile(
      task.file,
      [],
      (progress) => {
        task.progress = progress;
        task.message = progress < 100 ? 'Uploading file' : 'Finishing upload';
      }
    );

    this.activeUploads.set(task.id, handle);

    handle.promise
      .then((response) => this.onUploadCompleted(task, response))
      .catch((error: unknown) => this.onUploadFailed(task, error))
      .finally(() => {
        this.activeUploads.delete(task.id);
      });
  }

  private onUploadCompleted(task: UploadQueueItem, response: UploadedFileResponse): void {
    task.status = 'completed';
    task.progress = 100;
    task.message = 'Upload completed';
    task.error = undefined;
    task.progressBarClass = 'bg-emerald-500';

    const recentFile = this.mapResponseToCloudFile(response);
    this.recentFiles = [recentFile, ...this.recentFiles.filter(file => file.name !== recentFile.name)].slice(0, 12);
    this.setBanner(`Uploaded ${task.name} successfully.`, 'success');
    this.refreshRecentFiles();
  }

  private onUploadFailed(task: UploadQueueItem, error: unknown): void {
    const message = error instanceof Error ? error.message : 'Upload failed';
    if (message === 'Upload cancelled') {
      task.status = 'cancelled';
      task.message = 'Upload cancelled';
      task.progress = 0;
      return;
    }

    task.status = 'error';
    task.error = message;
    task.message = 'Upload failed';
    task.progress = 0;
    this.setBanner(`Could not upload ${task.name}.`, 'error');
  }

  private loadRecentFiles(): void {
    this.isLoadingRecentFiles = true;
    this.filesService.listFiles('recent').subscribe({
      next: (files) => {
        this.recentFiles = files;
        this.isLoadingRecentFiles = false;
      },
      error: () => {
        this.recentFiles = [];
        this.isLoadingRecentFiles = false;
      }
    });
  }

  private mapResponseToCloudFile(response: UploadedFileResponse): CloudFile {
    return {
      name: response.name,
      size: response.size,
      type: this.fileTypeFromName(response.name),
      uploadDate: response.uploadedAt ? new Date(response.uploadedAt) : new Date(),
      timeAgo: undefined,
      owner: 'Yo',
      tags: response.tags ?? [],
      aiSummary: undefined,
      aiTags: undefined
    };
  }

  private fileTypeFromName(fileName: string): CloudFile['type'] {
    const extension = fileName.split('.').pop()?.toLowerCase() ?? '';

    if (extension === 'png' || extension === 'jpg' || extension === 'jpeg' || extension === 'gif' || extension === 'webp') {
      return extension === 'jpg' || extension === 'jpeg' ? 'jpg' : 'png';
    }

    if (extension === 'xlsx' || extension === 'xls' || extension === 'csv') {
      return 'xlsx';
    }

    if (extension === 'doc' || extension === 'docx') {
      return 'doc';
    }

    return 'pdf';
  }

  private getVisualMeta(file: File): FileVisualMeta {
    const kind = file.type || file.name.split('.').pop()?.toLowerCase() || '';

    if (kind.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'].includes(kind)) {
      return {
        icon: 'image',
        iconBgClass: 'bg-blue-50',
        iconTextClass: 'text-blue-600',
        progressBarClass: 'bg-indigo-800'
      };
    }

    if (kind.startsWith('video/') || ['mp4', 'mov', 'webm', 'mkv'].includes(kind)) {
      return {
        icon: 'movie',
        iconBgClass: 'bg-purple-50',
        iconTextClass: 'text-purple-600',
        progressBarClass: 'bg-purple-600'
      };
    }

    if (kind.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'flac'].includes(kind)) {
      return {
        icon: 'graphic_eq',
        iconBgClass: 'bg-amber-50',
        iconTextClass: 'text-amber-600',
        progressBarClass: 'bg-amber-500'
      };
    }

    if (['xls', 'xlsx', 'csv'].includes(kind)) {
      return {
        icon: 'table_chart',
        iconBgClass: 'bg-emerald-50',
        iconTextClass: 'text-emerald-600',
        progressBarClass: 'bg-emerald-500'
      };
    }

    if (['doc', 'docx', 'txt', 'rtf'].includes(kind)) {
      return {
        icon: 'description',
        iconBgClass: 'bg-sky-50',
        iconTextClass: 'text-sky-600',
        progressBarClass: 'bg-sky-600'
      };
    }

    return {
      icon: 'draft',
      iconBgClass: 'bg-slate-100',
      iconTextClass: 'text-slate-600',
      progressBarClass: 'bg-indigo-800'
    };
  }

  private createTaskId(file: File): string {
    return `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 9)}`;
  }

  private formatBytes(bytes: number): string {
    if (bytes <= 0) {
      return '0 B';
    }

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  private setBanner(message: string, state: 'success' | 'error'): void {
    this.bannerMessage = message;
    this.bannerState = state;
  }
}
