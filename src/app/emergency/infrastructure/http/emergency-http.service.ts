import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  EmergencyAlert,
  EmergencyAlertResource,
  EmergencyStatus,
  EmergencyStatusInfo,
  EmergencyStatusResource,
  EmergencyType,
  OverallStatus,
} from '../../domain/models/emergency.models';

@Injectable({ providedIn: 'root' })
export class EmergencyHttpService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}${environment.apiPrefix}/emergency`;

  /** GET /api/v1/emergency/status */
  getStatus(): Observable<EmergencyStatusInfo> {
    return this.http
      .get<EmergencyStatusResource>(`${this.baseUrl}/status`)
      .pipe(map(toStatusInfo));
  }

  /** GET /api/v1/emergency/history?startDate=&endDate= */
  getHistory(startDate?: string, endDate?: string): Observable<EmergencyAlert[]> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http
      .get<EmergencyAlertResource[]>(`${this.baseUrl}/history`, { params })
      .pipe(map((rows) => rows.map(toAlert)));
  }

  /** GET /api/v1/emergency/{id} */
  getById(id: number): Observable<EmergencyAlert> {
    return this.http
      .get<EmergencyAlertResource>(`${this.baseUrl}/${id}`)
      .pipe(map(toAlert));
  }

  /** POST /api/v1/emergency/alerts */
  trigger(payload: {
    sensorId: string;
    gasLevel: number;
    type: EmergencyType;
    sensorLocation: string;
  }): Observable<EmergencyAlert> {
    return this.http
      .post<EmergencyAlertResource>(`${this.baseUrl}/alerts`, payload)
      .pipe(map(toAlert));
  }

  /** POST /api/v1/emergency/evacuate */
  evacuate(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/evacuate`, {});
  }

  /** PATCH /api/v1/emergency/{id}/resolve */
  resolve(emergencyId: number, adminUserId: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${emergencyId}/resolve`, {
      adminUserId,
    });
  }
}

function toAlert(resource: EmergencyAlertResource): EmergencyAlert {
  return {
    id: resource.id,
    sensorId: resource.sensorId ?? '—',
    gasLevel: resource.gasLevel ?? 0,
    type: parseEnum<EmergencyType>(resource.type, 'OTHER'),
    status: parseEnum<EmergencyStatus>(resource.status, 'ACTIVE'),
    triggeredAt: resource.triggeredAt,
    resolvedAt: resource.resolvedAt,
    resolvedBy: resource.resolvedBy,
    sensorLocation: resource.sensorLocation ?? '—',
  };
}

function toStatusInfo(resource: EmergencyStatusResource): EmergencyStatusInfo {
  return {
    isEmergencyActive: resource.isEmergencyActive ?? false,
    emergencyId: resource.emergencyId,
    type: resource.type ? parseEnum<EmergencyType>(resource.type, 'OTHER') : null,
    gasLevel: resource.gasLevel ?? 0,
    sensorLocation: resource.sensorLocation,
    triggeredAt: resource.triggeredAt,
    overallStatus: parseEnum<OverallStatus>(resource.overallStatus, 'NORMAL'),
  };
}

function parseEnum<T extends string>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  return value as T;
}
