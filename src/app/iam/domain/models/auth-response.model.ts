import { User } from './user.model';

export interface AuthResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}
