import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';


export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadChildren: () => import('./features/auth/auth-module').then(m => m.AuthModule)
  },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./features/dashboard/dashboard-page/dashboard-page').then(c => c.DashboardPage),
    canActivate: [authGuard]
  }
];