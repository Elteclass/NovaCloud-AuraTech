import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContextMenuService } from '../../../core/services/context-menu';

@Component({
  selector: 'app-context-menu',
  imports: [CommonModule],
  templateUrl: './context-menu.html'
})
export class ContextMenu {
  menuService = inject(ContextMenuService);

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

    // Aquí irían las llamadas a tu backend en el futuro
    console.log(`Acción: ${action} aplicada al archivo: ${file.name}`);
    this.menuService.closeMenu();
  }
}