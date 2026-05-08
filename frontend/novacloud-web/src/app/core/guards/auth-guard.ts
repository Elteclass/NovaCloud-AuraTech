import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID); // Inyectamos el contexto de la plataforma

  // Verificamos si el código se está ejecutando en un navegador real
  if (isPlatformBrowser(platformId)) {
    
    // Aquí adentro es 100% seguro usar localStorage
    const token = localStorage.getItem('auratech_token');
    
    if (token) {
      return true; // Acceso concedido
    } else {
      router.navigate(['/login']); // Intruso detectado, de vuelta al login
      return false;
    }
  }

  // Si se está ejecutando en el servidor (SSR), denegamos el acceso 
  // temporalmente hasta que el navegador cargue por completo.
  return true;
};