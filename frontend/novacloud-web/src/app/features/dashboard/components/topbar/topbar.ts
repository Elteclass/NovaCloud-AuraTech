import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { UserProfile } from '../../../../core/models/cloud-file.model';
import { ProfileService } from '../../../../core/services/http/profile.service';
import { NotificationsService } from '../../../../core/services/http/notifications.service';
import { AuthService } from '../../../../core/services/http/auth.service';
import { Router } from '@angular/router';
import { TokenService } from '../../../../core/services/token.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-topbar',
  imports: [],
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss',
})
export class Topbar implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);

  user: UserProfile = {
    fullName: 'USUARIO',
    role: 'ROL: VISUALIZADOR',
    avatarUrl: 'https://ui-avatars.com/api/?name=Usuario&background=0F172A&color=FFFFFF',
  };

  notificationCount = 0;
  showNotificationsPanel = false;
  showUserMenu = false;
  isLoggingOut = false;

  constructor(
    private readonly profileService: ProfileService,
    private readonly notificationsService: NotificationsService,
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.loadProfile();
    this.loadNotificationCount();
  }

  onNotificationsClick(): void {
    this.showUserMenu = false;
    this.showNotificationsPanel = !this.showNotificationsPanel;
  }

  onUserMenuClick(): void {
    this.showNotificationsPanel = false;
    this.showUserMenu = !this.showUserMenu;
  }

  logout(): void {
    if (this.isLoggingOut) {
      return;
    }

    this.isLoggingOut = true;
    this.authService.logout().subscribe({
      next: () => {
        this.isLoggingOut = false;
        this.showUserMenu = false;
      },
      error: () => {
        this.isLoggingOut = false;
        this.tokenService.clear();
        this.router.navigate(['/login']);
      }
    });
  }

  private loadProfile(): void {
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        const displayName = (profile.name || profile.email || 'Usuario').trim();
        this.user = {
          fullName: displayName.toUpperCase(),
          role: `ROL: ${this.mapRole(profile.role).toUpperCase()}`,
          avatarUrl: this.buildAvatarUrl(displayName),
        };
      },
      error: () => {
        // Keep default fallback user when profile endpoint fails.
      },
    });
  }

  private loadNotificationCount(): void {
    this.notificationsService.getCount().subscribe({
      next: (res) => {
        this.notificationCount = Number.isFinite(res.count) ? Math.max(0, res.count) : 0;
      },
      error: () => {
        this.notificationCount = 0;
      },
    });
  }

  private mapRole(role: string | undefined): string {
    if (!role) return 'Visualizador';
    if (role.toLowerCase() === 'admin') return 'Administrador';
    return role;
  }

  private buildAvatarUrl(name: string): string {
    const encoded = encodeURIComponent(name);
    return `https://ui-avatars.com/api/?name=${encoded}&background=0F172A&color=FFFFFF`;
  }
}
