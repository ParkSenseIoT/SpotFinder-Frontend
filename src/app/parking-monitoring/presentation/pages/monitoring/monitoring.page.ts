import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonitoringStore } from '../../../application/store/monitoring.store';
import { LiveParkingSlot, ParkingSlotStatus } from '../../../domain/models/monitoring.models';

@Component({
  selector: 'app-monitoring',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './monitoring.page.html',
  styleUrls: ['./monitoring.page.scss'],
})
export class MonitoringPage {
  readonly store = inject(MonitoringStore);

  getStayDuration(entryTime?: string): string {
    if (!entryTime) return '--h --m';
    const entry = new Date(entryTime);
    const now = new Date();
    const diffMs = now.getTime() - entry.getTime();
    if (Number.isNaN(diffMs) || diffMs < 0) return '--h --m';
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHrs.toString().padStart(2, '0')}h ${diffMins
      .toString()
      .padStart(2, '0')}m`;
  }

  toggleOutOfService(slot: LiveParkingSlot, event: Event): void {
    event.stopPropagation();
    const nextStatus: ParkingSlotStatus =
      slot.status === 'OUT_OF_SERVICE' ? 'AVAILABLE' : 'OUT_OF_SERVICE';
    this.store.updateSlotStatus({ slotId: slot.id, status: nextStatus });
  }
}
