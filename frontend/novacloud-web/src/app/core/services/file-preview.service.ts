import { Injectable, signal } from '@angular/core';
import { CloudFile } from '../models/cloud-file.model';

@Injectable({
  providedIn: 'root'
})
export class FilePreviewService {
  readonly selectedFile = signal<CloudFile | null>(null);

  open(file: CloudFile): void {
    this.selectedFile.set(file);
  }

  close(): void {
    this.selectedFile.set(null);
  }
}
