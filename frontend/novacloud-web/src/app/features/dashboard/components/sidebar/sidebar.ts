import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // <-- 1. Importamos el enrutador
import { NavItem, StorageInfo } from '../../../../core/models/cloud-file.model';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule], // <-- 2. Lo agregamos aquí
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {

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
}