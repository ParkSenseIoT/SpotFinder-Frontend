import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonitoringStore } from '../../../application/store/monitoring.store';

@Component({
  selector: 'app-monitoring',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './monitoring.page.html',
  styleUrls: ['./monitoring.page.scss']
})
export class MonitoringPage implements OnInit {
  readonly store = inject(MonitoringStore);

  ngOnInit(): void {
    this.store.loadAllSlots();
  }

  // Método para calcular la diferencia de horas y minutos
  getStayDuration(entryTime?: string): string {
    if (!entryTime) return '--h --m';
    const entry = new Date(entryTime);
    const now = new Date();
    const diffMs = now.getTime() - entry.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHrs.toString().padStart(2, '0')}h ${diffMins.toString().padStart(2, '0')}m`;
  }
}
