import { Injectable, signal } from '@angular/core';
import { CloudFile } from '../models/cloud-file.model';

@Injectable({
  providedIn: 'root'
})
export class FileBrowserService {
  viewMode = signal<'grid' | 'list'>('grid');
  availableTags: string[] = ['#Estrategia', '#Confidencial', '#Borrador', '#Finanzas', '#Aprobado', '#Urgente'];
  selectedTag = signal<string | null>(null);

  toggleViewMode(mode: 'grid' | 'list') {
    this.viewMode.set(mode);
  }

  toggleTag(tag: string) {
    if (this.selectedTag() === tag) {
      this.selectedTag.set(null);
    } else {
      this.selectedTag.set(tag);
    }
  }

  clearTag() {
    this.selectedTag.set(null);
  }

  filterFiles(files: CloudFile[]): CloudFile[] {
    const tag = this.selectedTag();
    if (!tag) {
      return files;
    }
    return files.filter(f => f.tags && f.tags.includes(tag));
  }
}
