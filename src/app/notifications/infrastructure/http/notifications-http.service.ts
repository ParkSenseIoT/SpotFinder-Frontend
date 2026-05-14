import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Notification, NotificationPreference, SystemHealthMetric, ActivityLogItem } from '../../domain/models/notification.models';
import { NotificationType, NotificationStatus, NotificationSeverity, NotificationChannel } from '../../domain/enums/notification.enums';
import { isUnreadStatus, severityFromNotificationType } from '../../domain/utils/notification-display.utils';

/**
 * Notifications API seam. Replace `of(...).pipe(delay())` with `HttpClient` calls
 * (e.g. `environment.apiUrl + '/api/v1/notifications'`) when the backend is available.
 * Real-time updates can later subscribe to WebSocket/STOMP and push into the same store.
 */
@Injectable({
  providedIn: 'root',
})
export class NotificationsHttpService {
  private mockNotifications: Notification[] = [
    {
      id: 'notif-1',
      userId: 'user-1',
      type: NotificationType.EMERGENCY_ALERT,
      title: 'Facility lockdown',
      body: 'Sector C is under lockdown due to an unresolved security event.',
      data: { sector: 'C', eventId: 'SEC-9901' },
      status: NotificationStatus.DELIVERED,
      severity: severityFromNotificationType(NotificationType.EMERGENCY_ALERT),
      channel: NotificationChannel.IN_APP,
      sentAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
    {
      id: 'notif-2',
      userId: 'user-1',
      type: NotificationType.PAYMENT_SUCCESS,
      title: 'Payment confirmed',
      body: 'Payment of $12.50 for session #492 has been processed.',
      data: { amount: 12.5, sessionId: '492' },
      status: NotificationStatus.DELIVERED,
      severity: severityFromNotificationType(NotificationType.PAYMENT_SUCCESS),
      channel: NotificationChannel.IN_APP,
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: 'notif-3',
      userId: 'user-1',
      type: NotificationType.PAYMENT_FAILED,
      title: 'Payment failed',
      body: 'Card charge for session #488 was declined by the issuer.',
      data: { amount: 8.0, sessionId: '488' },
      status: NotificationStatus.DELIVERED,
      severity: severityFromNotificationType(NotificationType.PAYMENT_FAILED),
      channel: NotificationChannel.IN_APP,
      sentAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    },
    {
      id: 'notif-4',
      userId: 'user-1',
      type: NotificationType.PAYMENT_REMINDER,
      title: 'Payment reminder',
      body: 'Session #501 will expire in 15 minutes with an unpaid balance.',
      data: { sessionId: '501' },
      status: NotificationStatus.SENT,
      severity: severityFromNotificationType(NotificationType.PAYMENT_REMINDER),
      channel: NotificationChannel.IN_APP,
      sentAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    },
    {
      id: 'notif-5',
      userId: 'user-1',
      type: NotificationType.ENTRY_CONFIRMED,
      title: 'Entry confirmed',
      body: 'Vehicle LPR-9021 authorized at North gate.',
      data: { gate: 'North', plate: 'LPR-9021' },
      status: NotificationStatus.READ,
      severity: severityFromNotificationType(NotificationType.ENTRY_CONFIRMED),
      channel: NotificationChannel.IN_APP,
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      readAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    },
    {
      id: 'notif-6',
      userId: 'user-1',
      type: NotificationType.SESSION_END,
      title: 'Session ended',
      body: 'Parking session #480 closed. Duration 1h 12m.',
      data: { sessionId: '480' },
      status: NotificationStatus.READ,
      severity: severityFromNotificationType(NotificationType.SESSION_END),
      channel: NotificationChannel.IN_APP,
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
      readAt: new Date(Date.now() - 1000 * 60 * 60 * 29).toISOString(),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 29).toISOString(),
    },
    {
      id: 'notif-7',
      userId: 'user-1',
      type: NotificationType.SYSTEM_ALERT,
      title: 'High latency detected',
      body: 'Node DX-4092 reported 250ms average round-trip.',
      data: { nodeId: 'DX-4092', latency: 250 },
      status: NotificationStatus.READ,
      severity: severityFromNotificationType(NotificationType.SYSTEM_ALERT),
      channel: NotificationChannel.IN_APP,
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      readAt: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(),
    },
    {
      id: 'notif-8',
      userId: 'user-1',
      type: NotificationType.ENTRY_CONFIRMED,
      title: 'Delivery channel failure',
      body: 'Push delivery to device token ****91 failed after retries.',
      data: { channel: 'PUSH' },
      status: NotificationStatus.FAILED,
      severity: NotificationSeverity.WARNING,
      channel: NotificationChannel.PUSH,
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    },
  ];

  private mockPreferences: NotificationPreference[] = [
    { notificationType: NotificationType.EMERGENCY_ALERT, enabled: true, locked: true },
    { notificationType: NotificationType.PAYMENT_SUCCESS, enabled: true },
    { notificationType: NotificationType.PAYMENT_FAILED, enabled: true },
    { notificationType: NotificationType.PAYMENT_REMINDER, enabled: false },
    { notificationType: NotificationType.ENTRY_CONFIRMED, enabled: true },
    { notificationType: NotificationType.SESSION_END, enabled: true },
    { notificationType: NotificationType.SYSTEM_ALERT, enabled: true },
  ];

  private mockSystemHealth: SystemHealthMetric[] = [
    { id: 'sh-1', name: 'Data ingestion', value: 99.8, unit: '%', status: 'online', trend: 'stable', lastUpdated: new Date().toISOString() },
    { id: 'sh-2', name: 'Avg latency', value: 45, unit: 'ms', status: 'online', trend: 'down', lastUpdated: new Date().toISOString() },
    { id: 'sh-3', name: 'Compute load', value: 78, unit: '%', status: 'warning', trend: 'up', lastUpdated: new Date().toISOString() },
    { id: 'sh-4', name: 'Active nodes', value: 142, unit: '', status: 'online', trend: 'stable', lastUpdated: new Date().toISOString() },
    { id: 'sh-5', name: 'Uptime (30d)', value: '99.97', unit: '%', status: 'online', trend: 'stable', lastUpdated: new Date().toISOString() },
    { id: 'sh-6', name: 'Broker cluster', value: 'Healthy', unit: '', status: 'online', trend: 'stable', lastUpdated: new Date().toISOString() },
  ];

  private mockActivityLogs: ActivityLogItem[] = [
    { id: 'act-1', title: 'Heartbeat sync', message: 'Main broker synchronized with edge nodes.', timestamp: new Date().toISOString(), status: 'success' },
    { id: 'act-2', title: 'Telemetry ingest', message: 'Processed 5.2k events in the last minute.', timestamp: new Date(Date.now() - 5000).toISOString(), status: 'success' },
    { id: 'act-3', title: 'Node retry', message: 'Node DX-109 retrying TLS handshake.', timestamp: new Date(Date.now() - 15000).toISOString(), status: 'warning' },
    { id: 'act-4', title: 'Cache flush', message: 'LRU cache flushed (20MB).', timestamp: new Date(Date.now() - 45000).toISOString(), status: 'info' },
  ];

  /** GET /api/v1/notifications/user/{userId} */
  getNotifications(userId: string): Observable<Notification[]> {
    return of([...this.mockNotifications]).pipe(delay(400));
  }

  /** GET /api/v1/notifications/user/{userId}/unread */
  getUnreadNotifications(userId: string): Observable<Notification[]> {
    const unread = this.mockNotifications.filter((n) => isUnreadStatus(n.status));
    return of(unread).pipe(delay(300));
  }

  /** PATCH /api/v1/notifications/{id}/read */
  markAsRead(notificationId: string): Observable<Notification> {
    const notif = this.mockNotifications.find((n) => n.id === notificationId);
    if (!notif) return throwError(() => new Error('Notification not found'));

    const updated: Notification = {
      ...notif,
      status: NotificationStatus.READ,
      readAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.mockNotifications = this.mockNotifications.map((n) => (n.id === notificationId ? updated : n));

    return of(updated).pipe(delay(200));
  }

  /** PATCH /api/v1/notifications/{id}/acknowledge — backend may reuse READ; same effect in mock. */
  acknowledge(notificationId: string): Observable<Notification> {
    return this.markAsRead(notificationId);
  }

  /** PATCH /api/v1/notifications/{id}/dismiss — until archive/DELETE exists, client removes from inbox in mock. */
  dismiss(notificationId: string): Observable<void> {
    const idx = this.mockNotifications.findIndex((n) => n.id === notificationId);
    if (idx === -1) return throwError(() => new Error('Notification not found'));
    this.mockNotifications.splice(idx, 1);
    return of(undefined).pipe(delay(200));
  }

  /** GET /api/v1/users/{userId}/notification-preferences */
  getPreferences(userId: string): Observable<NotificationPreference[]> {
    return of([...this.mockPreferences]).pipe(delay(300));
  }

  /** PUT /api/v1/users/{userId}/notification-preferences */
  updatePreferences(userId: string, preferences: NotificationPreference[]): Observable<NotificationPreference[]> {
    this.mockPreferences = [...preferences];
    return of(this.mockPreferences).pipe(delay(400));
  }

  /** GET /api/v1/operations/health-metrics (mock path; align with real ops endpoint later). */
  getSystemHealth(): Observable<SystemHealthMetric[]> {
    const randomized = this.mockSystemHealth.map((sh) => {
      if (sh.name === 'Compute load') {
        const val = Math.floor(Math.random() * 40) + 40;
        return {
          ...sh,
          value: val,
          status: val > 85 ? 'warning' : 'online',
          lastUpdated: new Date().toISOString(),
        } as SystemHealthMetric;
      }
      if (sh.name === 'Avg latency') {
        const val = Math.floor(Math.random() * 20) + 30;
        return { ...sh, value: val, lastUpdated: new Date().toISOString() };
      }
      if (sh.name === 'Data ingestion') {
        const val = Math.round((98.5 + Math.random() * 1.4) * 10) / 10;
        return { ...sh, value: val, lastUpdated: new Date().toISOString() };
      }
      return { ...sh, lastUpdated: new Date().toISOString() };
    });
    return of(randomized).pipe(delay(200));
  }

  /** GET /api/v1/operations/activity-log */
  getActivityLogs(): Observable<ActivityLogItem[]> {
    return of([...this.mockActivityLogs]).pipe(delay(200));
  }
}
