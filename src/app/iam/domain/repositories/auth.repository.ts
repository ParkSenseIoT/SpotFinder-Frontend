import { Observable } from 'rxjs';
import { AuthResponse } from '../models/auth-response.model';
import { LoginCredentials } from '../models/login-credentials.model';

export abstract class AuthRepository {
  abstract signIn(credentials: LoginCredentials): Observable<AuthResponse>;
}
