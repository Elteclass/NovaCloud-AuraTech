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
  // Mock: Archivos modificados recientemente
  recentFiles: CloudFile[] = [
    { name: 'Notas_Reunion_Hoy.docx', size: '1.2 MB', type: 'doc', uploadDate: new Date(), timeAgo: 'Hace 10 minutos' },
    { name: 'Borrador_Diseño.jpg',    size: '4.5 MB', type: 'jpg', uploadDate: new Date(), timeAgo: 'Hace 2 horas' },
    { name: 'Presupuesto_Urgente.xlsx', size: '2.1 MB', type: 'xlsx', uploadDate: new Date(), timeAgo: 'Hace 5 horas' },
  ];
}
