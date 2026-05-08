import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface KpiCard {
  title: string;
  value: string;
  growth: string;
  icon: string;
  iconBgClass: string;
  iconTextClass: string;
}

interface LogEntry {
  title: string;
  details: string;
  icon: string;
  iconClass: string;
}

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule],
  templateUrl: './admin-dashboard.html'
})
export class AdminDashboard {
  // Mock: Tarjetas Superiores
  kpiCards: KpiCard[] = [
    { title: 'USUARIOS TOTALES', value: '12,840', growth: '+5.2%', icon: 'group', iconBgClass: 'bg-orange-50', iconTextClass: 'text-orange-500' },
    { title: 'SESIONES ACTIVAS', value: '3,412', growth: '+12.4%', icon: 'bolt', iconBgClass: 'bg-blue-50', iconTextClass: 'text-blue-500' },
    { title: 'TIEMPO DE ACTIVIDAD', value: 'Operativo', growth: '99.9%', icon: 'dns', iconBgClass: 'bg-purple-50', iconTextClass: 'text-purple-500' }
  ];

  // Mock: Logs del Sistema
  latestLogs: LogEntry[] = [
    { title: 'Pico de Latencia - EU-West', details: 'Detectado hace 4 mins • Resuelto automáticamente', icon: 'warning', iconClass: 'text-amber-500' },
    { title: 'Nuevo Administrador Creado', details: 'Por Admin Principal • hace 12 mins', icon: 'check_circle', iconClass: 'text-emerald-500' },
    { title: 'Mantenimiento del Sistema Programado', details: 'Para el domingo, 02:00 AM UTC', icon: 'info', iconClass: 'text-blue-500' }
  ];
}