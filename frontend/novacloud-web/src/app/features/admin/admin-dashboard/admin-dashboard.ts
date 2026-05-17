import { Component, inject, OnInit, computed, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AdminService } from '../../../core/services/http/admin.service';

interface RecentRecord {
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

  private readonly adminService = inject(AdminService);
  private readonly platformId = inject(PLATFORM_ID);

  // ── KPIs — sourced from AdminService
  readonly totalUsers  = this.adminService.totalUsers;   // signal
  readonly activeUsers = this.adminService.activeUsers;  // signal

  /** KPI cards that don't need reactive data */
  readonly staticKpi = {
    title: 'TIEMPO DE ACTIVIDAD',
    value: 'Operativo',
    growth: '99.9%',
    icon: 'dns',
    iconBgClass: 'bg-purple-50',
    iconTextClass: 'text-purple-500',
  };

  // ── Últimos Registros (derivados del backend)
  readonly latestRecords = computed<RecentRecord[]>(() => {
    return [...this.adminService.users()]
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
      .slice(0, 3)
      .map(user => ({
        title: user.name || user.email,
        details: `${user.role} • ${user.status} • creado ${new Date(user.createdAt).toLocaleDateString('es-ES')}`,
        icon: user.role === 'Administrador' ? 'admin_panel_settings' : 'person',
        iconClass: user.role === 'Administrador' ? 'text-orange-500' : 'text-slate-500',
      }));
  });

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.adminService.loadUsers();
    this.adminService.loadStats();
  }
}
