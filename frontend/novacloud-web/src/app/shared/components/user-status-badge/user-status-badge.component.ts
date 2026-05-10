import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserStatus } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="inline-flex items-center gap-1.5 text-xs font-semibold" [ngClass]="textClass">
      <span class="w-1.5 h-1.5 rounded-full" [ngClass]="dotClass"></span>
      {{ status }}
    </span>
  `
})
export class UserStatusBadgeComponent {
  @Input() status: UserStatus = 'Activo';

  private readonly STATUS_MAP: Record<UserStatus, { text: string; dot: string }> = {
    'Activo':     { text: 'text-emerald-600', dot: 'bg-emerald-500' },
    'Inactivo':   { text: 'text-slate-400',   dot: 'bg-slate-300' },
    'Suspendido': { text: 'text-red-500',      dot: 'bg-red-500' },
  };

  get textClass(): string { return this.STATUS_MAP[this.status]?.text ?? ''; }
  get dotClass():  string { return this.STATUS_MAP[this.status]?.dot  ?? ''; }
}
