import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ChangePasswordPayload,
  RegisterVehiclePayload,
  UpdateProfilePayload,
  Vehicle,
  VehicleResource,
} from '../../domain/models/settings.models';
import { AdminUser, UserResource } from '../../../user-management/domain/models/admin-user.models';

@Injectable({ providedIn: 'root' })
export class SettingsHttpService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}${environment.apiPrefix}/users`;

  /** GET /api/v1/users/{userId} */
  getProfile(userId: number): Observable<AdminUser> {
    return this.http
      .get<UserResource>(`${this.baseUrl}/${userId}`)
      .pipe(map(toAdminUser));
  }

  /** PUT /api/v1/users/{userId} */
  updateProfile(userId: number, payload: UpdateProfilePayload): Observable<AdminUser> {
    return this.http
      .put<UserResource>(`${this.baseUrl}/${userId}`, payload)
      .pipe(map(toAdminUser));
  }

  /** POST /api/v1/users/{userId}/change-password */
  changePassword(userId: number, payload: ChangePasswordPayload): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${userId}/change-password`, payload);
  }

  /** GET /api/v1/users/{userId}/vehicles */
  listVehicles(userId: number): Observable<Vehicle[]> {
    return this.http
      .get<VehicleResource[]>(`${this.baseUrl}/${userId}/vehicles`)
      .pipe(map((rows) => rows.map(toVehicle)));
  }

  /** POST /api/v1/users/{userId}/vehicles */
  registerVehicle(userId: number, payload: RegisterVehiclePayload): Observable<Vehicle> {
    return this.http
      .post<VehicleResource>(`${this.baseUrl}/${userId}/vehicles`, payload)
      .pipe(map(toVehicle));
  }

  /** DELETE /api/v1/users/{userId}/vehicles/{vehicleId} */
  deleteVehicle(userId: number, vehicleId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/${userId}/vehicles/${vehicleId}`
    );
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

function toVehicle(resource: VehicleResource): Vehicle {
  return {
    id: resource.id,
    userId: resource.userId,
    plate: resource.plate,
    brand: resource.brand,
    model: resource.model,
    color: resource.color,
    createdAt: resource.createdAt,
  };
}
