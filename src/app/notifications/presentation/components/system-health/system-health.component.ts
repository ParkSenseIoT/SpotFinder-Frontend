import { Component, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { NotificationsStore } from '../../../application/store/notifications.store';

@Component({
  selector: 'app-system-health',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  template: `
    <div class="system-health-grid">
      @for (metric of store.systemHealth(); track metric.id) {
        <div class="health-card">
          <div class="health-header">
            <span class="name">{{ metric.name }}</span>
            <span class="status-dot" [ngClass]="metric.status"></span>
          </div>
          <div class="health-body">
            @if (isNumeric(metric.value)) {
              <h3 class="value">
                {{ metric.value | number: '1.0-1' }}<span class="unit">{{ metric.unit }}</span>
              </h3>
            } @else {
              <h3 class="value">
                {{ metric.value }}<span class="unit">{{ metric.unit }}</span>
              </h3>
            }
            @if (metric.trend) {
              <span class="trend" [ngClass]="metric.trend">{{ getTrendIcon(metric.trend) }}</span>
            }
          </div>
        </div>
      }
    </div>
  `,
  styleUrls: ['./system-health.component.scss'],
})
export class SystemHealthComponent {
  readonly store = inject(NotificationsStore);

  isNumeric(value: number | string): value is number {
    return typeof value === 'number' && !Number.isNaN(value);
  }

  getTrendIcon(trend: string): string {
    switch (trend) {
      case 'up':
        return '↑';
      case 'down':
        return '↓';
      case 'stable':
        return '→';
      default:
        return '';
    }
  }
}
