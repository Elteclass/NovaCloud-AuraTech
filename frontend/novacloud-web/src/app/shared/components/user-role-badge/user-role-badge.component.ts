import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-role-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="inline-block px-2.5 py-0.5 rounded-md text-xs font-bold tracking-wide"
      [ngClass]="badgeClass"
    >
      {{ role }}
    </span>
  `
})
export class UserRoleBadgeComponent {
  @Input() role: UserRole = 'Visualizador';

  private readonly ROLE_MAP: Record<UserRole, string> = {
    'Administrador': 'bg-orange-100 text-orange-600',
    'Editor':        'bg-blue-100 text-blue-600',
    'Visualizador':  'bg-slate-100 text-slate-600',
    'Soporte':       'bg-purple-100 text-purple-600',
  };

  get badgeClass(): string {
    return this.ROLE_MAP[this.role] ?? 'bg-slate-100 text-slate-500';
  }
}
