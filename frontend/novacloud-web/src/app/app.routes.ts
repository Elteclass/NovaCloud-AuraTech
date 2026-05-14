import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { adminGuard } from './core/guards/admin-guard'; // Importamos el guard de administrador

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadChildren: () => import('./features/auth/auth-module').then(m => m.AuthModule)
  },
  
  // ==========================================
  // --- ENTORNO ADMINISTRADOR (Sin Sidebar) --
  // ==========================================
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-layout/admin-layout').then(c => c.AdminLayout),
    canActivate: [adminGuard], // Protegemos todo el layout
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard').then(c => c.AdminDashboard)
      },
      {
        path: 'users',
        loadComponent: () => import('./features/admin/users-page/users-page').then(c => c.UsersPage)
      },
      // --- NUEVA RUTA DE LOGS ---
      {
        path: 'logs',
        loadComponent: () => import('./features/admin/logs-page/logs-page').then(c => c.LogsPage)
      }
    ]
  },

  // ==========================================
  // --- LAYOUT USUARIOS (Con Sidebar) --------
  // ==========================================
  {
    path: '', 
    loadComponent: () => import('./features/dashboard/main-layout/main-layout').then(c => c.MainLayout),
    canActivate: [authGuard], // El usuario debe estar logueado
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard-page/dashboard-page').then(c => c.DashboardPage)
      },
      {
        path: 'recientes',
        loadComponent: () => import('./features/dashboard/recent-page/recent-page').then(c => c.RecentPage)
      },
      {
        path: 'destacados',
        loadComponent: () => import('./features/dashboard/starred-page/starred-page').then(c => c.StarredPage)
      },
      {
        path: 'papelera',
        loadComponent: () => import('./features/dashboard/trash-page/trash-page').then(c => c.TrashPage)
      },
      {
        path: 'carga',
        loadComponent: () => import('./features/dashboard/upload-page/upload-page').then(c => c.UploadPage)
      }
    ]
  }
];