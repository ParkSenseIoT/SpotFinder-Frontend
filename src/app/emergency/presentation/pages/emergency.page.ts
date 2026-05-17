import { Component, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { EmergencyStore } from '../../application/store/emergency.store';
import { EmergencyAlert } from '../../domain/models/emergency.models';

@Component({
  selector: 'app-emergency-page',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './emergency.page.html',
  styleUrls: ['./emergency.page.scss'],
})
export class EmergencyPage {
  readonly store = inject(EmergencyStore);

  readonly confirmEvacuate = signal(false);

  refresh(): void {
    this.store.loadStatus();
    this.store.loadHistory();
  }

  requestEvacuation(): void {
    this.confirmEvacuate.set(true);
  }

  cancelEvacuation(): void {
    this.confirmEvacuate.set(false);
  }

  confirmAndEvacuate(): void {
    this.confirmEvacuate.set(false);
    this.store.activateEvacuation();
  }

  resolve(alert: EmergencyAlert): void {
    this.store.resolveEmergency(alert.id);
  }
}
