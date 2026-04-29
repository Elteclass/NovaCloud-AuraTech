import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavItem, StorageInfo } from '../../../../core/models/cloud-file.model';
import { FolderModalService } from '../../../../core/services/folder-modal'; 

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule], 
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  // Inyectamos el servicio para poder usarlo en este componente
  folderModalService = inject(FolderModalService);

  // REGLA DE NEGOCIO: "Compartidos conmigo" eliminado del menú
  navItems: NavItem[] = [
    { label: 'Mi Unidad',   icon: 'hard_drive', route: '/dashboard' },
    { label: 'Recientes',   icon: 'schedule',   route: '/recientes' },
    { label: 'Destacados',  icon: 'star',       route: '/destacados' },
    { label: 'Papelera',    icon: 'delete',     route: '/papelera' },
  ];

  storage: StorageInfo = {
    usedGB: 42.5,
    totalGB: 50,
    percentage: 85,
  };

  // Método que será llamado cuando se haga clic en el botón "Nueva Carpeta"
  openNewFolderModal() {
    this.folderModalService.openModal();
  }
}