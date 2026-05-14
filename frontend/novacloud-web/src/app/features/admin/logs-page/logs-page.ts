import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserAvatarComponent } from '../../../shared/components/user-avatar/user-avatar.component';

export interface AuditLog {
  id: number;
  date: string;
  isToday: boolean;
  userInitials: string;
  userName: string;
  userEmail: string;
  role: 'Admin' | 'User';
  avatarColor: string; 
  action: string;
  actionType: 'warning' | 'neutral' | 'success' | 'danger'; 
  ip: string;
}

@Component({
  selector: 'app-logs-page',
  standalone: true,
  imports: [CommonModule, UserAvatarComponent],
  templateUrl: './logs-page.html',
  styleUrl: './logs-page.scss'
})
export class LogsPage {
  
  // 1. Signals de estado
  activeFilter = signal<string>('Hoy');
  currentPage = signal<number>(1);
  itemsPerPage = 5; // Constante para la cantidad de filas por página

  // 2. Base de datos (Agregué uno más para que veas el cambio de página si quitas el filtro)
  allLogs = signal<AuditLog[]>([
    { id: 1, date: '13 May 2026, 14:30', isToday: true, userInitials: 'AP', userName: 'Alex Parker', userEmail: 'aparker@auratech.com', role: 'Admin', avatarColor: 'blue', action: 'INICIO SESIÓN', actionType: 'success', ip: '192.168.1.1' },
    { id: 2, date: '13 May 2026, 10:15', isToday: true, userInitials: 'JD', userName: 'John Doe', userEmail: 'jdoe@auratech.com', role: 'User', avatarColor: 'orange', action: 'LOGIN FALLIDO', actionType: 'danger', ip: '45.23.11.89' },
    { id: 3, date: '12 May 2026, 16:45', isToday: false, userInitials: 'MG', userName: 'Maria Garcia', userEmail: 'mgarcia@auratech.com', role: 'Admin', avatarColor: 'green', action: 'ACTUALIZAR CONFIG', actionType: 'neutral', ip: '201.142.45.10' },
    { id: 4, date: '12 May 2026, 12:05', isToday: false, userInitials: 'SY', userName: 'System', userEmail: 'sysadmin@auratech.com', role: 'Admin', avatarColor: 'gray', action: 'BACKUP COMPLETADO', actionType: 'success', ip: 'Localhost' },
    { id: 5, date: '11 May 2026, 09:00', isToday: false, userInitials: 'AP', userName: 'Alex Parker', userEmail: 'aparker@auratech.com', role: 'Admin', avatarColor: 'blue', action: 'ELIMINAR USUARIO', actionType: 'danger', ip: '192.168.1.1' },
    { id: 6, date: '11 May 2026, 08:30', isToday: false, userInitials: 'JD', userName: 'John Doe', userEmail: 'jdoe@auratech.com', role: 'User', avatarColor: 'orange', action: 'CREAR API KEY', actionType: 'success', ip: '45.23.11.89' },
    { id: 7, date: '10 May 2026, 11:20', isToday: false, userInitials: 'MG', userName: 'Maria Garcia', userEmail: 'mgarcia@auratech.com', role: 'Admin', avatarColor: 'green', action: 'INICIO SESIÓN', actionType: 'success', ip: '201.142.45.10' }
  ]);

  // 3. LA MAGIA REACTIVA:

  // A. Filtramos la lista completa según el botón activo
  filteredLogs = computed(() => {
    const logs = this.allLogs();
    const filter = this.activeFilter();

    switch (filter) {
      case 'Hoy':
        return logs.filter(log => log.isToday === true);
      case 'Usuarios Admin':
        return logs.filter(log => log.role === 'Admin');
      case 'Fallidos':
        return logs.filter(log => log.actionType === 'danger');
      case 'Exitosos':
        return logs.filter(log => log.actionType === 'success');
      default:
        return logs;
    }
  });

  // B. Extraemos solo los 5 registros de la página actual
  pagedLogs = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    return this.filteredLogs().slice(start, start + this.itemsPerPage);
  });

  // C. Calculamos dinámicamente las variables de la barra de paginación
  totalPages = computed(() => Math.ceil(this.filteredLogs().length / this.itemsPerPage) || 1);
  
  // Array de números [1, 2, 3...] para generar los botones con un @for en el HTML
  pagesArray = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  rangeStart = computed(() => this.filteredLogs().length === 0 ? 0 : (this.currentPage() - 1) * this.itemsPerPage + 1);
  rangeEnd = computed(() => Math.min(this.currentPage() * this.itemsPerPage, this.filteredLogs().length));

  // 4. Métodos
  setFilter(filterName: string) {
    this.activeFilter.set(filterName);
    this.currentPage.set(1); // Siempre regresamos a la página 1 al filtrar
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }
}