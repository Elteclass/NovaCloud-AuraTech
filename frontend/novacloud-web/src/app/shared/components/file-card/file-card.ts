import { Component, Input, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CloudFile } from '../../../core/models/cloud-file.model';
import { FilePreviewService } from '../../../core/services/file-preview.service';
import { ContextMenuService } from '../../../core/services/context-menu';

@Component({
  selector: 'app-file-card',
  imports: [CommonModule],
  templateUrl: './file-card.html',
  styleUrl: './file-card.scss',
})
export class FileCard {
  @Input({ required: true }) file!: CloudFile;

  // Inyectamos ambos servicios en el constructor para mantener la consistencia
  constructor(
    private filePreviewService: FilePreviewService,
    private menuService: ContextMenuService
  ) {}

  // Escuchamos el evento 'contextmenu' (clic derecho) en toda la tarjeta
  @HostListener('contextmenu', ['$event'])
  onRightClick(event: MouseEvent): void {
    // Llamamos a nuestro servicio pasando el evento y los datos de este archivo
    this.menuService.openMenu(event, this.file);
  }

  openPreview(): void {
    this.filePreviewService.open(this.file);
  }

  /** Returns the Material Symbols icon name based on file type */
  get fileIcon(): string {
    switch (this.file.type) {
      case 'pdf': return 'description';
      case 'doc': return 'article';
      case 'xlsx': return 'table_view';
      case 'jpg':
      case 'png': return 'image';
      default: return 'insert_drive_file';
    }
  }

  /** Returns the Tailwind text color class for the icon based on file type */
  get iconColorClass(): string {
    switch (this.file.type) {
      case 'pdf': return 'text-red-500';
      case 'doc': return 'text-blue-500';
      case 'xlsx': return 'text-green-600';
      case 'jpg':
      case 'png': return 'text-amber-500';
      default: return 'text-slate-500';
    }
  }
}