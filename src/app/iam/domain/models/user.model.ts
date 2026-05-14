export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  isVerified: boolean;
  active: boolean;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}
