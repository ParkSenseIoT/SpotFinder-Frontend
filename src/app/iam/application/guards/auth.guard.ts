import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenStorageService } from '../../infrastructure/storage/token-storage.service';

export const authGuard: CanActivateFn = (route, state) => {
  const tokenStorage = inject(TokenStorageService);
  const router = inject(Router);

  // Comprobamos si el token existe en el almacenamiento
  if (tokenStorage.getToken()) {
    return true;
  }

  // Si no hay token, lo mandamos al login
  router.navigate(['/auth/login']);
  return false;
};
