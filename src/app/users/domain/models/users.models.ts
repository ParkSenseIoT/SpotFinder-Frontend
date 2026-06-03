export enum UserRole {
  ADMIN = 'ADMIN',
  CAR_OWNER = 'CAR_OWNER',
}

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: UserRole[];
  active: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface CreateAdminRequest {
  email: string;
  firstName: string;
  lastName: string;
  initialPassword: string;
}
