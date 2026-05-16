import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { TokenStorageService } from '../../iam/infrastructure/storage/token-storage.service';

const PUBLIC_PATHS = ['/users/signin', '/users/signup', '/auth/login', '/auth/register'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const tokenStorage = inject(TokenStorageService);

  const token = tokenStorage.getToken();

  let authReq = req;
  if (token) {
    authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const isPublicRoute = PUBLIC_PATHS.some((path) => req.url.includes(path));
      if (error.status === 401 && !isPublicRoute) {
        tokenStorage.clearSession();
        router.navigate(['/auth/login'], { replaceUrl: true });
      }
      return throwError(() => error);
    })
  );
};
