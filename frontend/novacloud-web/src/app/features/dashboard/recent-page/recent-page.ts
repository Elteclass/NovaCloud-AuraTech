import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CloudFile } from '../../../core/models/cloud-file.model';
import { FileCard } from '../../../shared/components/file-card/file-card';

@Component({
  selector: 'app-recent-page',
  imports: [CommonModule, FileCard],
  templateUrl: './recent-page.html'
})
export class RecentPage {
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
      return this.recentFiles;
    }
    return this.recentFiles.filter(f => f.tags && f.tags.includes(this.selectedTag!));
  }
  // Mock: Archivos modificados recientemente
  recentFiles: CloudFile[] = [
    { name: 'Notas_Reunion_Hoy.docx', size: '1.2 MB', type: 'doc', uploadDate: new Date(), timeAgo: 'Hace 10 minutos', owner: 'Luis Mendoza', tags: ['#Urgente', '#Borrador'] },
    { name: 'Borrador_Diseño.jpg',    size: '4.5 MB', type: 'jpg', uploadDate: new Date(), timeAgo: 'Hace 2 horas', owner: 'Ana Torres', tags: ['#Estrategia'] },
    { name: 'Presupuesto_Urgente.xlsx', size: '2.1 MB', type: 'xlsx', uploadDate: new Date(), timeAgo: 'Hace 5 horas', owner: 'Carlos Ruiz', tags: ['#Finanzas', '#Urgente'] },
  ];
}
