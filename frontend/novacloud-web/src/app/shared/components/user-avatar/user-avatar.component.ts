import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 select-none"
      [ngClass]="avatarClasses"
    >
      {{ initials }}
    </div>
  `
})
export class UserAvatarComponent {
  @Input() initials: string = '?';
  @Input() color: string = 'orange';

  /** Maps color name → Tailwind bg + text pair */
  private readonly COLOR_MAP: Record<string, string> = {
    orange: 'bg-orange-100 text-orange-600',
    blue:   'bg-blue-100 text-blue-600',
    green:  'bg-emerald-100 text-emerald-600',
    purple: 'bg-purple-100 text-purple-600',
    pink:   'bg-pink-100 text-pink-600',
    red:    'bg-red-100 text-red-600',
    teal:   'bg-teal-100 text-teal-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    yellow: 'bg-yellow-100 text-yellow-700',
    gray:   'bg-slate-100 text-slate-500',
    cyan:   'bg-cyan-100 text-cyan-600',
  };

  get avatarClasses(): string {
    return this.COLOR_MAP[this.color] ?? this.COLOR_MAP['orange'];
  }
}
