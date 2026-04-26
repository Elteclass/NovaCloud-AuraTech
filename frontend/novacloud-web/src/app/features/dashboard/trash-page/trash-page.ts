import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CloudFile } from '../../../core/models/cloud-file.model';
import { FileCard } from '../../../shared/components/file-card/file-card';

@Component({
  selector: 'app-trash-page',
  imports: [CommonModule, FileCard],
  templateUrl: './trash-page.html'
})
export class TrashPage {
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
      return this.trashedFiles;
    }
    return this.trashedFiles.filter(f => f.tags && f.tags.includes(this.selectedTag!));
  }
  // Mock: Archivos eliminados
  trashedFiles: CloudFile[] = [
    { name: 'Factura_Vieja_2023.pdf', size: '1.1 MB', type: 'pdf', uploadDate: new Date('2026-04-10'), timeAgo: 'Eliminado hace 2 días', owner: 'Carlos Ruiz', tags: ['#Finanzas'] },
    { name: 'Copia_de_Borrador.doc', size: '500 KB', type: 'doc', uploadDate: new Date('2026-04-05'), timeAgo: 'Eliminado hace 5 días', owner: 'Luis Mendoza', tags: ['#Borrador'] },
  ];
}