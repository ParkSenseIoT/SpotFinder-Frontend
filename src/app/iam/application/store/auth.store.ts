// src/app/iam/application/store/auth.store.ts
import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, tap, of } from 'rxjs';
import { Router } from '@angular/router';
import { TokenStorageService } from '../../infrastructure/storage/token-storage.service';
import { LoginRequest } from '../../infrastructure/http/auth-http.service';

interface AuthState {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, tokenStorage = inject(TokenStorageService), router = inject(Router)) => ({
    login: rxMethod<LoginRequest>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        tap((credentials) => {
          // --- MOCK: acepta cualquier email/contraseña ---
          // Si quieres validar solo una cuenta fija, descomenta las líneas de abajo
          // const validEmail = 'admin@mall.com';
          // const validPassword = '12345678';
          // if (credentials.email !== validEmail || credentials.password !== validPassword) {
          //   patchState(store, { error: 'Credenciales inválidas', isLoading: false });
          //   return;
          // }

          // Simulamos un usuario
          const mockUser = {
            id: 1,
            email: credentials.email,
            firstName: 'Mock',
            lastName: 'User',
            isVerified: true,
            active: true,
            roles: ['ADMIN'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          const mockToken = 'mock-jwt-token-' + Date.now();
          tokenStorage.saveSession(mockToken, mockUser);
          patchState(store, { user: mockUser, isAuthenticated: true, isLoading: false });
          router.navigate(['/dashboard']);
        })
      )
    ),
    logout() {
      tokenStorage.clearSession();
      patchState(store, initialState);
      router.navigate(['/auth/login']);
    }
  }))
);
