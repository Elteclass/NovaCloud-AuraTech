import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContextMenuService } from '../../../core/services/context-menu';
import { FilesService } from '../../../core/services/http/files.service';

@Component({
  selector: 'app-context-menu',
  imports: [CommonModule],
  templateUrl: './context-menu.html'
})
export class ContextMenu {
  menuService = inject(ContextMenuService);
  filesService = inject(FilesService);

  // Esto hace que si haces clic izquierdo en cualquier otra parte de la pantalla, el menú se cierre
  @HostListener('document:click')
  closeOnOutsideClick() {
    if (this.menuService.isOpen()) {
      this.menuService.closeMenu();
    }
  }

  handleAction(action: string) {
    const file = this.menuService.selectedFile();
    if (!file) return;

    if (action === 'Destacar') {
      this.filesService.starFile((file as any).id || (file as any).name).subscribe({ next: () => { alert('Archivo actualizado'); window.location.reload(); }, error: () => alert('Error') });
      this.menuService.closeMenu();
      return;
    }

    if (action === 'Renombrar') {
      const newName = prompt('Nuevo nombre de archivo', file.name);
      if (!newName) { this.menuService.closeMenu(); return; }
      this.filesService.renameFile((file as any).id || (file as any).name, newName).subscribe({ next: () => { alert('Renombrado'); window.location.reload(); }, error: () => alert('Error al renombrar') });
      this.menuService.closeMenu();
      return;
    }

    if (action === 'Descargar') {
      this.filesService.getDownloadUrl((file as any).id || (file as any).name).subscribe({ next: (res) => { window.open(res.url, '_blank'); }, error: () => alert('Error al obtener URL') });
      this.menuService.closeMenu();
      return;
    }

    if (action === 'Mover a papelera') {
      this.filesService.trashFile((file as any).id || (file as any).name).subscribe({ next: () => { alert('Archivo enviado a papelera'); window.location.reload(); }, error: () => alert('Error') });
      this.menuService.closeMenu();
      return;
    }

    this.menuService.closeMenu();
  }
}