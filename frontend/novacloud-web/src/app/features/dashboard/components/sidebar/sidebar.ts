import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavItem, StorageInfo } from '../../../../core/models/cloud-file.model';
import { FolderModalService } from '../../../../core/services/folder-modal'; 
import { FilesService } from '../../../../core/services/http/files.service';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule], 
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  private readonly platformId = inject(PLATFORM_ID);
  // Inyectamos el servicio para poder usarlo en este componente
  constructor(
    public folderModalService: FolderModalService,
    private filesService: FilesService,
  ) {}

  // REGLA DE NEGOCIO: "Compartidos conmigo" eliminado del menú
  navItems: NavItem[] = [
    { label: 'Mi Unidad',   icon: 'hard_drive', route: '/dashboard' },
    { label: 'Recientes',   icon: 'schedule',   route: '/recientes' },
    { label: 'Destacados',  icon: 'star',       route: '/destacados' },
    { label: 'Papelera',    icon: 'delete',     route: '/papelera' },
  ];

  storage: StorageInfo = {
    usedGB: 0,
    totalGB: 0,
    percentage: 0,
  };

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.filesService.getStorageUsage().subscribe({
      next: (usage) => this.storage = usage,
      error: () => this.storage = { usedGB: 0, totalGB: 0, percentage: 0 }
    });
  }

  // Método que será llamado cuando se haga clic en el botón "Nueva Carpeta"
  openNewFolderModal() {
    this.folderModalService.openModal();
  }
}
