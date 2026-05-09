import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (isPlatformBrowser(platformId)) {
    // Validamos que exista un rol guardado y que sea explícitamente "admin"
    const role = localStorage.getItem('auratech_role');
    
    if (role === 'admin') {
      return true; // Es admin, pasa al dashboard naranja
    }
  }

  // Si no es admin, o es SSR, lo regresamos al dashboard de usuarios regulares
  router.navigate(['/dashboard']);
  return false;
};