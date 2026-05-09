import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // 1. Verificamos si estamos en el navegador
  if (isPlatformBrowser(platformId)) {
    
    const token = localStorage.getItem('auratech_token');
    
    // Si el token existe, lo dejamos pasar
    if (token) {
      return true; 
    }
  }

  // 2. Si no hay token, o si es SSR, bloqueamos y lo mandamos al login
  router.navigate(['/login']);
  return false;
};