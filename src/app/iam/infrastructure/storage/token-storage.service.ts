import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  private readonly TOKEN_KEY = 'spotfinder_jwt';
  private readonly USER_KEY = 'spotfinder_user';

  // Guarda el token y los datos del usuario al hacer login/registro
  saveSession(token: string, user: any): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  // 👇 ESTE ES EL MÉTODO QUE FALTABA 👇
  // Limpia el almacenamiento cuando el usuario hace logout
  clearSession(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  // Recupera el token para inyectarlo en las peticiones HTTP
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Recupera los datos del usuario guardados
  getUser(): any | null {
    const user = localStorage.getItem(this.USER_KEY);
    if (user) {
      return JSON.parse(user);
    }
    return null;
  }
}
