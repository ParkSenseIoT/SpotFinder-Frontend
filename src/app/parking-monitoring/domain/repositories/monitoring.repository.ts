import { Observable } from 'rxjs';
import { MonitoringKPIs, ParkingSlot, IoTEventLog } from '../models/monitoring.models';

export abstract class MonitoringRepository {
  abstract getKPIs(): Observable<MonitoringKPIs>;
  abstract getSectorSlots(sectorId: string): Observable<ParkingSlot[]>;
  // Nota: Más adelante aquí agregaremos la conexión WebSocket para los Live Events
  abstract getRecentEvents(): Observable<IoTEventLog[]>;
}
