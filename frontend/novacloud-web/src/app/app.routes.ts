import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadChildren: () => import('./features/auth/auth-module').then(m => m.AuthModule)
  },
  // Tu nueva ruta
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard-page/dashboard-page').then(m => m.DashboardPage)
  }
];