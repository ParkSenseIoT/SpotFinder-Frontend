import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AdminUser, UserResource } from '../../domain/models/admin-user.models';

@Injectable({ providedIn: 'root' })
export class UsersHttpService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}${environment.apiPrefix}/users`;

  /** GET /api/v1/users */
  listAll(): Observable<AdminUser[]> {
    return this.http
      .get<UserResource[]>(this.baseUrl)
      .pipe(map((rows) => rows.map(toAdminUser)));
  }

  /** GET /api/v1/users/{userId} */
  getById(userId: number): Observable<AdminUser> {
    return this.http
      .get<UserResource>(`${this.baseUrl}/${userId}`)
      .pipe(map(toAdminUser));
  }

  /** GET /api/v1/users/available-roles */
  getAvailableRoles(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/available-roles`);
  }
}

function toAdminUser(resource: UserResource): AdminUser {
  return {
    id: resource.id,
    email: resource.email,
    firstName: resource.firstName,
    lastName: resource.lastName,
    isVerified: resource.isVerified,
    active: resource.active,
    roles: resource.roles ?? [],
    createdAt: resource.createdAt,
    updatedAt: resource.updatedAt,
  };
}
