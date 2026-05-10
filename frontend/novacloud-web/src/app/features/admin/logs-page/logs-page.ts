import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserAvatarComponent } from '../../../shared/components/user-avatar/user-avatar.component';

export interface AuditLog {
  date: string;
  userInitials: string;
  userName: string;
  avatarColor: string; // Adaptado al componente de Jaime ('blue', 'green', 'gray', etc.)
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
  
  auditLogs: AuditLog[] = [
    { date: '24 Oct 2023, 14:30', userInitials: 'AP', userName: 'Alex Parker', avatarColor: 'blue', action: 'INICIO SESIÓN', actionType: 'warning', ip: '192.168.1.1' },
    { date: '24 Oct 2023, 13:15', userInitials: 'MG', userName: 'Maria Garcia', avatarColor: 'green', action: 'ACTUALIZAR CONFIG', actionType: 'neutral', ip: '201.142.45.10' },
    { date: '24 Oct 2023, 12:05', userInitials: 'SY', userName: 'System', avatarColor: 'gray', action: 'BACKUP COMPLETADO', actionType: 'success', ip: 'Localhost' },
    { date: '24 Oct 2023, 10:45', userInitials: 'AP', userName: 'Alex Parker', avatarColor: 'blue', action: 'ELIMINAR USUARIO', actionType: 'danger', ip: '192.168.1.1' },
    { date: '24 Oct 2023, 09:00', userInitials: 'JD', userName: 'John Doe', avatarColor: 'orange', action: 'CREAR API KEY', actionType: 'neutral', ip: '45.23.11.89' }
  ];
}