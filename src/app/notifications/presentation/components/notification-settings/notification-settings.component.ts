import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationsStore } from '../../../application/store/notifications.store';
import { NotificationType } from '../../../domain/enums/notification.enums';

@Component({
  selector: 'app-notification-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-modal" *ngIf="isOpen">
      <div class="modal-backdrop" (click)="close()"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3>Notification preferences</h3>
          <button type="button" class="btn-icon" (click)="close()" aria-label="Close">✕</button>
        </div>

        <div class="modal-body">
          <p class="description">Choose which notification classes are delivered in-app.</p>

          <div class="preferences-list">
            @for (pref of store.preferences(); track pref.notificationType) {
              <div class="preference-item">
                <div class="pref-info">
                  <span class="pref-name">{{ formatType(pref.notificationType) }}</span>
                  @if (pref.locked) {
                    <span class="locked-badge">Required</span>
                  }
                </div>
                <label class="toggle-switch">
                  <input
                    type="checkbox"
                    [checked]="pref.enabled"
                    [disabled]="pref.locked"
                    (change)="onToggle(pref.notificationType, $event)" />
                  <span class="slider"></span>
                </label>
              </div>
            }
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-outline" (click)="close()">Done</button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./notification-settings.component.scss'],
})
export class NotificationSettingsComponent {
  readonly store = inject(NotificationsStore);
  isOpen = false;

  open() {
    this.isOpen = true;
  }

  close() {
    this.isOpen = false;
  }

  formatType(type: NotificationType): string {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
  }

  onToggle(type: NotificationType, event: Event) {
    const input = event.target as HTMLInputElement;
    this.store.setPreferenceEnabled({ type, enabled: input.checked });
  }
}
