import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  // MOCK: Aquí iría la validación real con tu servicio de autenticación
  const isAdmin = true; 

  if (isAdmin) {
    return true;
  } else {
    // Si no es admin, lo pateamos de regreso a su unidad personal
    router.navigate(['/dashboard']);
    return false;
  }
};