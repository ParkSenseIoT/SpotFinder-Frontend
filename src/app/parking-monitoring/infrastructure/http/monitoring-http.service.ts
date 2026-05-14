import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { LiveParkingSlot } from '../../domain/models/monitoring.models';

@Injectable({ providedIn: 'root' })
export class MonitoringHttpService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/v1/parking-monitoring';

  // ⚠️ NOTA PARA TU BACKEND: Crea un endpoint equivalente a esto que haga un JOIN
  // entre ParkingSlot, ParkingSession (Activa) y Vehicle para obtener la placa y la hora.
  getAllLiveSlots(): Observable<LiveParkingSlot[]> {
    // Calculamos horas dinámicas para el mock
    const now = new Date();
    const minus2Hours = new Date(now.getTime() - (2 * 60 * 60 * 1000)).toISOString();
    const minus45Mins = new Date(now.getTime() - (45 * 60 * 1000)).toISOString();

    // 👇 AQUÍ ESTÁ EL CAMBIO: of<LiveParkingSlot[]>([...])
    return of<LiveParkingSlot[]>([
      // GRUPO 1 (Se agrupará solo)
      { id: 1, code: 'A-01', status: 'AVAILABLE', floor: 1 },
      { id: 2, code: 'A-02', status: 'OCCUPIED', floor: 1, currentPlate: 'CA-8XF92', entryTime: minus2Hours },
      { id: 3, code: 'A-03', status: 'AVAILABLE', floor: 1 },
      { id: 4, code: 'A-04', status: 'OCCUPIED', floor: 1, currentPlate: 'NY-442KK', entryTime: minus45Mins },
      { id: 5, code: 'A-05', status: 'AVAILABLE', floor: 1 },
      { id: 6, code: 'A-06', status: 'AVAILABLE', floor: 1 },

      // GRUPO 2 (Se agrupará solo)
      { id: 7, code: 'B-01', status: 'OCCUPIED', floor: 1, currentPlate: 'TX-198LL', entryTime: minus2Hours },
      { id: 8, code: 'B-02', status: 'OUT_OF_SERVICE', floor: 1 },
      { id: 9, code: 'B-03', status: 'AVAILABLE', floor: 1 },
      { id: 10, code: 'B-04', status: 'AVAILABLE', floor: 1 },
      { id: 11, code: 'B-05', status: 'AVAILABLE', floor: 1 },
      { id: 12, code: 'B-06', status: 'AVAILABLE', floor: 1 }
    ]).pipe(delay(500));
  }
}
