import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { NotificationsStore } from '../../../application/store/notifications.store';

@Component({
  selector: 'app-activity-log',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="activity-panel">
      <div class="panel-header">
        <h3>Live stream</h3>
        <span class="icon pulse" aria-hidden="true">●</span>
      </div>
      <div class="activity-content">
        @if (store.activityLogs().length === 0) {
          <div class="empty-state">No recent activity</div>
        } @else {
          <div class="timeline">
            @for (log of store.activityLogs(); track log.id) {
              <div class="timeline-item" [ngClass]="log.status">
                <div class="timeline-marker"></div>
                <div class="timeline-content">
                  <div class="log-header">
                    <span class="title">{{ log.title }}</span>
                    <span class="time">{{ log.timestamp | date: 'HH:mm:ss' }}</span>
                  </div>
                  <p class="message">{{ log.message }}</p>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styleUrls: ['./activity-log.component.scss'],
})
export class ActivityLogComponent {
  readonly store = inject(NotificationsStore);
}
