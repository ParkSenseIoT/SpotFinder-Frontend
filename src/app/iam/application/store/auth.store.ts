import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { Router } from '@angular/router';
import { TokenStorageService } from '../../infrastructure/storage/token-storage.service';
import { AuthHttpService, LoginRequest, AuthResponse } from '../../infrastructure/http/auth-http.service';

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
  withMethods(
    (
      store,
      authService = inject(AuthHttpService),
      tokenStorage = inject(TokenStorageService),
      router = inject(Router)
    ) => ({

      // Cambiamos 'signIn' por 'login' y le pasamos el tipo LoginRequest
      login: rxMethod<LoginRequest>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((credentials) =>
            authService.login(credentials).pipe(
              // Tipamos la respuesta como AuthResponse para que deje de ser 'unknown'
              tapResponse({
                next: (response: AuthResponse) => {
                  tokenStorage.saveSession(response.token, response.user);
                  patchState(store, { user: response.user, isAuthenticated: true, isLoading: false });
                  router.navigate(['/dashboard']);
                },
                error: (err) => {
                  console.error(err);
                  patchState(store, { error: 'Invalid credentials or server offline', isLoading: false });
                },
              })
            )
          )
        )
      ),

      logout() {
        tokenStorage.clearSession();
        patchState(store, initialState);
        router.navigate(['/auth/login']);
      }
    })
  )
);
