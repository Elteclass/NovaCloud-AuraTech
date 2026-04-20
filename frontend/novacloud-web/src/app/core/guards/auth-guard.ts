import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  // Buscamos nuestra llave simulada en el navegador
  const token = localStorage.getItem('auratech_token');
  
  if (token) {
    return true; // Acceso concedido
  } else {
    router.navigate(['/login']); // Intruso detectado, de vuelta al login
    return false;
  }
};