import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationFeedComponent } from '../../components/notification-feed/notification-feed.component';
import { ActivityLogComponent } from '../../components/activity-log/activity-log.component';
import { SystemHealthComponent } from '../../components/system-health/system-health.component';
import { NotificationSettingsComponent } from '../../components/notification-settings/notification-settings.component';

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [
    CommonModule,
    NotificationFeedComponent,
    ActivityLogComponent,
    SystemHealthComponent,
    NotificationSettingsComponent,
  ],
  template: `
    <div class="notifications-dashboard">
      <div class="dashboard-header">
        <div>
          <h2 class="page-title">Notification center</h2>
          <p class="page-subtitle">Real-time alerts, system health, and operational activity.</p>
        </div>
        <button type="button" class="btn-outline" (click)="openSettings()">Preferences</button>
      </div>

      <div class="dashboard-content">
        <div class="main-column">
          <div class="feed-wrapper">
            <app-notification-feed></app-notification-feed>
          </div>
        </div>

        <div class="side-column">
          <div class="side-panel side-panel--metrics">
            <div class="side-panel-header">
              <h3>System health · live metrics</h3>
              <span class="live-dot" aria-hidden="true"></span>
            </div>
            <div class="side-panel-body">
              <app-system-health></app-system-health>
            </div>
          </div>

          <div class="side-panel side-panel--log">
            <div class="side-panel-header">
              <h3>Activity log</h3>
            </div>
            <div class="side-panel-body">
              <app-activity-log></app-activity-log>
            </div>
          </div>
        </div>
      </div>

      <app-notification-settings #settingsModal></app-notification-settings>
    </div>
  `,
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage {
  @ViewChild('settingsModal') settingsModal!: NotificationSettingsComponent;

  openSettings() {
    this.settingsModal.open();
  }
}
