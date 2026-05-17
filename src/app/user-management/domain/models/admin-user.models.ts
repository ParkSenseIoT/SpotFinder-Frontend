export interface AdminUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  isVerified: boolean;
  active: boolean;
  roles: string[];
  createdAt: string | null;
  updatedAt: string | null;
}

export interface UserResource {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  isVerified: boolean;
  active: boolean;
  roles: string[];
  createdAt: string | null;
  updatedAt: string | null;
}

export type RoleFilter = 'ALL' | 'ADMIN' | 'DRIVER';
