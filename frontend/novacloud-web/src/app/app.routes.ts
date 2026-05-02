import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadChildren: () => import('./features/auth/auth-module').then(m => m.AuthModule)
  },
  // --- LAYOUT MAESTRO (Contiene las barras fijas) ---
  {
    path: '', 
    loadComponent: () => import('./features/dashboard/main-layout/main-layout').then(c => c.MainLayout), // Revisa si el tuyo dice main-layout.component
    canActivate: [authGuard],
    // --- RUTAS HIJAS (Cambian en el centro de la pantalla) ---
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
      // --- Nueva Ruta del Centro de Carga ---
      {
        path: 'carga',
        loadComponent: () => import('./features/dashboard/upload-page/upload-page').then(c => c.UploadPage)
      }
    ]
  }
];