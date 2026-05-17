import { Component, inject } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { AdminService } from '../../../core/services/http/admin.service';
import { AuthService } from '../../../core/services/http/auth.service';
import { TokenService } from '../../../core/services/token.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayout {
  private router = inject(Router);
  private adminService = inject(AdminService);
  private authService = inject(AuthService);
  private tokenService = inject(TokenService);
  showUserMenu = false;
  isLoggingOut = false;

  /** True cuando la ruta activa es /admin/users */
  readonly isUsersSection = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(() => this.router.url.includes('/admin/users'))
    ),
    { initialValue: this.router.url.includes('/admin/users') }
  );

  get searchValue(): string {
    return this.adminService.searchQuery();
  }

  onSearch(value: string): void {
    this.adminService.setSearchQuery(value);
  }

  toggleUserMenu(): void {
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
}
