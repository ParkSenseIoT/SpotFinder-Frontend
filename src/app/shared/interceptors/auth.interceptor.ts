import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // En el futuro lo sacaremos de un TokenStorageService, por ahora leemos directo de localStorage
  const token = localStorage.getItem('spotfinder_jwt');

  // 1. Clonar la petición e inyectar el Bearer Token si existe
  let authReq = req;
  if (token) {
    authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
  }

  // 2. Manejar la respuesta
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // 3. Logout Forzoso si el backend responde 401 Unauthorized
      if (error.status === 401 && !req.url.includes('/signin')) {
        console.warn('Sesión expirada o inválida. Redirigiendo al login...');
        localStorage.removeItem('spotfinder_jwt');
        localStorage.removeItem('spotfinder_user');
        router.navigate(['/auth/login'], { replaceUrl: true });
      }
      return throwError(() => error);
    })
  );
};
