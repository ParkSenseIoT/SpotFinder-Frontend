import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  EntryRequest,
  ExitRequest,
  PaymentStatus,
  PlateRecognitionResult,
  SessionStatus,
  VehicleSession,
  VehicleSessionResource,
} from '../../domain/models/access-control.models';

@Injectable({ providedIn: 'root' })
export class AccessControlHttpService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}${environment.apiPrefix}`;

  /** POST /api/v1/access/entries */
  registerEntry(req: EntryRequest): Observable<VehicleSession> {
    return this.http
      .post<VehicleSessionResource>(`${this.baseUrl}/access/entries`, req)
      .pipe(map(toVehicleSession));
  }

  /** POST /api/v1/access/exits */
  registerExit(req: ExitRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/access/exits`, req);
  }

  /** POST /api/v1/access/alpr */
  recognizePlate(imageData: string, cameraPosition: string): Observable<PlateRecognitionResult> {
    return this.http.post<PlateRecognitionResult>(`${this.baseUrl}/access/alpr`, {
      imageData,
      cameraPosition,
    });
  }

  /** GET /api/v1/parking-sessions/active?userId={id} */
  getActiveSession(userId: number): Observable<VehicleSession | null> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http
      .get<VehicleSessionResource>(`${this.baseUrl}/parking-sessions/active`, { params })
      .pipe(map((res) => (res ? toVehicleSession(res) : null)));
  }

  /** GET /api/v1/parking-sessions/{id} */
  getSessionById(id: number): Observable<VehicleSession> {
    return this.http
      .get<VehicleSessionResource>(`${this.baseUrl}/parking-sessions/${id}`)
      .pipe(map(toVehicleSession));
  }

  /** GET /api/v1/parking-sessions/history?userId={id} */
  getSessionHistory(userId: number): Observable<VehicleSession[]> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http
      .get<VehicleSessionResource[]>(`${this.baseUrl}/parking-sessions/history`, { params })
      .pipe(map((rows) => rows.map(toVehicleSession)));
  }

  /** PATCH /api/v1/parking-sessions/{id}/end */
  endSession(sessionId: number): Observable<void> {
    return this.http.patch<void>(
      `${this.baseUrl}/parking-sessions/${sessionId}/end`,
      {}
    );
  }
}

function toVehicleSession(resource: VehicleSessionResource): VehicleSession {
  return {
    id: resource.id,
    licensePlate: resource.licensePlate ?? '—',
    entryTimestamp: resource.entryTimestamp,
    exitTimestamp: resource.exitTimestamp,
    slotId: resource.slotId,
    paymentStatus: parseEnum<PaymentStatus>(resource.paymentStatus, 'PENDING'),
    sessionStatus: parseEnum<SessionStatus>(resource.sessionStatus, 'ACTIVE'),
    currentDuration: resource.currentDuration ?? '—',
    userId: resource.userId,
  };
}

function parseEnum<T extends string>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  return value as T;
}
