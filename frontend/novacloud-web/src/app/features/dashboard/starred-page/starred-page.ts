import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CloudFile } from '../../../core/models/cloud-file.model';
import { FileCard } from '../../../shared/components/file-card/file-card';

@Component({
  selector: 'app-starred-page',
  imports: [CommonModule, FileCard],
  templateUrl: './starred-page.html'
})
export class StarredPage {
  viewMode: 'grid' | 'list' = 'grid';

  availableTags: string[] = ['#Estrategia', '#Confidencial', '#Borrador', '#Finanzas', '#Aprobado', '#Urgente'];
  selectedTag: string | null = null;

  toggleViewMode(mode: 'grid' | 'list') {
    this.viewMode = mode;
  }

  toggleTag(tag: string) {
    if (this.selectedTag === tag) {
      this.selectedTag = null;
    } else {
      this.selectedTag = tag;
    }
  }

  get filteredFiles(): CloudFile[] {
    if (!this.selectedTag) {
      return this.starredFiles;
    }
    return this.starredFiles.filter(f => f.tags && f.tags.includes(this.selectedTag!));
  }
  // Mock: Archivos marcados como importantes
  starredFiles: CloudFile[] = [
    { name: 'Contrato_Firma_Final.pdf', size: '3.5 MB', type: 'pdf', uploadDate: new Date('2026-03-15'), timeAgo: 'Hace 1 mes', owner: 'Ana Torres', tags: ['#Aprobado', '#Confidencial'] },
    { name: 'Logo_AuraTech_Oficial.jpg', size: '8.2 MB', type: 'jpg', uploadDate: new Date('2026-01-10'), timeAgo: 'Hace 3 meses', owner: 'Marketing Team', tags: ['#Aprobado'] },
  ];
}