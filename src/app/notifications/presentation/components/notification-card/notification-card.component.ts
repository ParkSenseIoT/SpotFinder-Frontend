import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Notification } from '../../../domain/models/notification.models';
import { NotificationSeverity, NotificationStatus, NotificationType } from '../../../domain/enums/notification.enums';
import { isUnreadStatus, severityFromNotificationType } from '../../../domain/utils/notification-display.utils';

export interface OperationalActionEvent {
  notificationId: string;
  title: string;
  message: string;
}

@Component({
  selector: 'app-notification-card',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div
      class="notification-card"
      [ngClass]="[displaySeverity().toLowerCase(), notification.status.toLowerCase()]">
      <div class="card-icon">
        <span class="icon" aria-hidden="true">{{ getIcon(notification.type) }}</span>
      </div>

      <div class="card-content">
        <div class="card-header">
          <h4 class="title">{{ notification.title }}</h4>
          <span class="time">{{ notification.createdAt | date: 'shortTime' }}</span>
        </div>
        <p class="body">{{ notification.body }}</p>

        @if (notification.data) {
          <div class="meta-data">
            @if (notification.data['sector']) {
              <span class="badge">Sector {{ notification.data['sector'] }}</span>
            }
            @if (notification.data['gate']) {
              <span class="badge">Gate {{ notification.data['gate'] }}</span>
            }
            @if (notification.data['sessionId']) {
              <span class="badge">Session #{{ notification.data['sessionId'] }}</span>
            }
            @if (notification.data['amount'] != null) {
              <span class="badge">Amount {{ notification.data['amount'] | currency }}</span>
            }
            @if (notification.data['nodeId']) {
              <span class="badge">Node {{ notification.data['nodeId'] }}</span>
            }
          </div>
        }

        @if (isUnread()) {
          <div class="card-actions">
            <button type="button" class="btn-text" (click)="markAsRead.emit(notification.id)">Mark read</button>
            @if (displaySeverity() === NotificationSeverity.CRITICAL) {
              <button type="button" class="btn-text" (click)="acknowledge.emit(notification.id)">
                Acknowledge
              </button>
            }
            @if (notification.data?.['sector']) {
              <button
                type="button"
                class="btn-text"
                (click)="emitOperational('Sector drill-down', 'Operator opened sector ' + (notification.data?.['sector'] ?? '') + ' from notification ' + notification.id + '.')">
                Open sector
              </button>
            }
            @if (notification.data?.['sessionId']) {
              <button
                type="button"
                class="btn-text"
                (click)="emitOperational('Session trace', 'Opened session ' + (notification.data?.['sessionId'] ?? '') + ' in monitoring shell (simulated).')">
                View session
              </button>
            }
            <button type="button" class="btn-icon" (click)="dismiss.emit(notification.id)" title="Dismiss">
              ✕
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styleUrls: ['./notification-card.component.scss'],
})
export class NotificationCardComponent {
  @Input({ required: true }) notification!: Notification;

  @Output() markAsRead = new EventEmitter<string>();
  @Output() acknowledge = new EventEmitter<string>();
  @Output() dismiss = new EventEmitter<string>();
  @Output() operationalAction = new EventEmitter<OperationalActionEvent>();

  readonly NotificationSeverity = NotificationSeverity;

  displaySeverity(): NotificationSeverity {
    return severityFromNotificationType(this.notification.type);
  }

  isUnread(): boolean {
    return isUnreadStatus(this.notification.status);
  }

  emitOperational(title: string, message: string) {
    this.operationalAction.emit({
      notificationId: this.notification.id,
      title,
      message,
    });
  }

  getIcon(type: NotificationType): string {
    switch (type) {
      case NotificationType.EMERGENCY_ALERT:
        return '🚨';
      case NotificationType.PAYMENT_SUCCESS:
        return '✓';
      case NotificationType.PAYMENT_FAILED:
        return '!';
      case NotificationType.PAYMENT_REMINDER:
        return '⏱';
      case NotificationType.ENTRY_CONFIRMED:
        return '▸';
      case NotificationType.SESSION_END:
        return '■';
      case NotificationType.SYSTEM_ALERT:
        return '⚡';
      default:
        return '●';
    }
  }
}
