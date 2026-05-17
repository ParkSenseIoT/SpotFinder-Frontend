import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import {
  LiveParkingSlot,
  OccupancySummary,
  ParkingSlotResource,
  ParkingSlotStatus,
} from '../../domain/models/monitoring.models';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MonitoringHttpService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}${environment.apiPrefix}/parking-slots`;

  getAllLiveSlots(facilityId?: number): Observable<LiveParkingSlot[]> {
    const url = facilityId ? `${this.apiUrl}?facilityId=${facilityId}` : this.apiUrl;
    return this.http.get<ParkingSlotResource[]>(url).pipe(
      map((resources) => resources.map((r) => toLiveSlot(r)))
    );
  }

  getAvailableSlots(facilityId?: number): Observable<LiveParkingSlot[]> {
    const url = facilityId
      ? `${this.apiUrl}/available?facilityId=${facilityId}`
      : `${this.apiUrl}/available`;
    return this.http.get<ParkingSlotResource[]>(url).pipe(
      map((resources) => resources.map(toLiveSlot))
    );
  }

  getOccupancySummary(facilityId?: number): Observable<OccupancySummary> {
    const url = facilityId
      ? `${this.apiUrl}/occupancy?facilityId=${facilityId}`
      : `${this.apiUrl}/occupancy`;
    return this.http.get<OccupancySummary>(url);
  }

  updateStatus(slotId: number, status: ParkingSlotStatus): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${slotId}/status`, { status });
  }
}

function toLiveSlot(resource: ParkingSlotResource): LiveParkingSlot {
  return {
    id: resource.id,
    code: resource.slotCode,
    status: normalizeStatus(resource.status),
    floor: resource.facilityId ?? 1,
    sensorId: resource.sensorId ?? undefined,
    facilityId: resource.facilityId ?? undefined,
    lastUpdated: resource.lastUpdated ?? undefined,
  };
}

function normalizeStatus(status: string): ParkingSlotStatus {
  const upper = status?.toUpperCase();
  if (upper === 'OCCUPIED') return 'OCCUPIED';
  if (upper === 'OUT_OF_SERVICE') return 'OUT_OF_SERVICE';
  return 'AVAILABLE';
}
