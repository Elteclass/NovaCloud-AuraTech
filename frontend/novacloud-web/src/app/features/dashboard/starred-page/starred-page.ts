import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CloudFile } from '../../../core/models/cloud-file.model';
import { FileListViewComponent } from '../../../shared/components/file-list-view/file-list-view.component';

@Component({
  selector: 'app-starred-page',
  imports: [CommonModule, FileListViewComponent],
  templateUrl: './starred-page.html'
})
export class StarredPage {
  // Mock: Archivos marcados como importantes
  starredFiles: CloudFile[] = [
    { name: 'Contrato_Firma_Final.pdf', size: '3.5 MB', type: 'pdf', uploadDate: new Date('2026-03-15'), timeAgo: 'Hace 1 mes', owner: 'Ana Torres', tags: ['#Aprobado', '#Confidencial'] },
    { name: 'Logo_AuraTech_Oficial.jpg', size: '8.2 MB', type: 'jpg', uploadDate: new Date('2026-01-10'), timeAgo: 'Hace 3 meses', owner: 'Marketing Team', tags: ['#Aprobado'] },
  ];
}