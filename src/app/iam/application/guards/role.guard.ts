import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenStorageService } from '../../infrastructure/storage/token-storage.service';

const ADMIN_ROLES = new Set(['ADMIN', 'ROLE_ADMIN']);

export const adminRoleGuard: CanActivateFn = () => {
  const tokenStorage = inject(TokenStorageService);
  const router = inject(Router);

  const user = tokenStorage.getUser();
  const roles: string[] = user?.roles ?? [];

  const isAdmin = roles.some((role) => ADMIN_ROLES.has(role));
  if (isAdmin) {
    return true;
  }

  tokenStorage.clearSession();
  router.navigate(['/auth/login'], { replaceUrl: true });
  return false;
};
