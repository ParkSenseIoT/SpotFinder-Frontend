import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AdminUser, CreateAdminRequest, UserRole } from '../../domain/models/users.models';

/**
 * Users API seam — `/api/v1/users/*` and `/api/v1/auth/register` in production.
 * Currently backed by an in-memory mock list so admins can be created/
 * deactivated for validation.
 */
@Injectable({ providedIn: 'root' })
export class UsersHttpService {
  private mock: AdminUser[] = buildMockUsers();

  list(): Observable<AdminUser[]> {
    return of([...this.mock]).pipe(delay(380));
  }

  createAdmin(req: CreateAdminRequest): Observable<AdminUser> {
    const created: AdminUser = {
      id: `usr-${Date.now().toString(36).toUpperCase()}`,
      email: req.email.trim().toLowerCase(),
      firstName: req.firstName.trim(),
      lastName: req.lastName.trim(),
      roles: [UserRole.ADMIN],
      active: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: null,
    };
    this.mock = [created, ...this.mock];
    return of(created).pipe(delay(360));
  }

  toggleActive(id: string): Observable<AdminUser> {
    this.mock = this.mock.map(u => u.id === id ? { ...u, active: !u.active } : u);
    return of(this.mock.find(u => u.id === id)!).pipe(delay(220));
  }
}

function buildMockUsers(): AdminUser[] {
  const now = Date.now();
  const ago = (h: number) => new Date(now - h * 3_600_000).toISOString();
  return [
    { id: 'usr-001', email: 'henry.esteban@upc.edu.pe',   firstName: 'Henry Kalet',    lastName: 'Esteban Román',   roles: [UserRole.ADMIN],     active: true,  createdAt: ago(720), lastLoginAt: ago(2) },
    { id: 'usr-002', email: 'leonardo.duenas@upc.edu.pe', firstName: 'Leonardo Manuel', lastName: 'Dueñas Canales',  roles: [UserRole.ADMIN],     active: true,  createdAt: ago(720), lastLoginAt: ago(6) },
    { id: 'usr-003', email: 'andres.cruz@upc.edu.pe',     firstName: 'Victor Andrés',   lastName: 'Cruz Ibarra',     roles: [UserRole.ADMIN],     active: true,  createdAt: ago(120), lastLoginAt: ago(48) },
    { id: 'usr-004', email: 'irving.allcca@upc.edu.pe',   firstName: 'Irving Washington', lastName: 'Allcca Guerrero', roles: [UserRole.ADMIN], active: true,  createdAt: ago(720), lastLoginAt: ago(14) },
    { id: 'usr-005', email: 'miguel.vidal@upc.edu.pe',    firstName: 'Miguel Angel',   lastName: 'Vidal Castro',    roles: [UserRole.ADMIN],     active: true,  createdAt: ago(48),  lastLoginAt: ago(1) },
    { id: 'usr-101', email: 'driver.demo@spotfinder.pe',  firstName: 'Driver',         lastName: 'Demo',            roles: [UserRole.CAR_OWNER], active: true,  createdAt: ago(170), lastLoginAt: ago(3) },
    { id: 'usr-102', email: 'driver.old@spotfinder.pe',   firstName: 'Driver',         lastName: 'Old',             roles: [UserRole.CAR_OWNER], active: false, createdAt: ago(990), lastLoginAt: ago(720) },
  ];
}
