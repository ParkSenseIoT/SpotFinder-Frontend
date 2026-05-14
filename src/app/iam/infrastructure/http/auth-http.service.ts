import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

// Tipado exacto basado en SignUpResource.java de tu backend
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  requestedRole: 'ADMIN' | 'DRIVER'; // Basado en tu Enum Roles
}

// Tipado exacto basado en SignInResource.java
export interface LoginRequest {
  email: string;
  password: string;
}

// Tipado exacto basado en AuthenticationResponseResource.java
export interface AuthResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
  };
}

@Injectable({ providedIn: 'root' })
export class AuthHttpService {
  private readonly http = inject(HttpClient);
  // URL base exacta de tu controlador
  private readonly apiUrl = 'http://localhost:8080/api/v1/users';

  register(data: RegisterRequest): Observable<string> {
    return this.http.post(`${this.apiUrl}/signup`, data, { responseType: 'text' });
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/signin`, credentials);
  }
}
