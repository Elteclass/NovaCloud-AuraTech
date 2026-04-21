import { Component } from '@angular/core';
import { NavItem, StorageInfo } from '../../../../core/models/cloud-file.model';

@Component({
  selector: 'app-sidebar',
  imports: [],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {

  // REGLA DE NEGOCIO: "Compartidos conmigo" eliminado del menú
  navItems: NavItem[] = [
    { label: 'Mi Unidad',   icon: 'hard_drive', active: true },
    { label: 'Recientes',   icon: 'schedule',   active: false },
    { label: 'Destacados',  icon: 'star',       active: false },
    { label: 'Papelera',    icon: 'delete',     active: false },
  ];

  storage: StorageInfo = {
    usedGB: 42.5,
    totalGB: 50,
    percentage: 85,
  };
}
