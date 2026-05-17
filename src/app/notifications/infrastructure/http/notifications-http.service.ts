import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {
  ActivityLogItem,
  Notification,
  NotificationPreference,
  SystemHealthMetric,
} from '../../domain/models/notification.models';
import {
  NotificationChannel,
  NotificationStatus,
  NotificationType,
} from '../../domain/enums/notification.enums';
import { severityFromNotificationType } from '../../domain/utils/notification-display.utils';

interface NotificationResource {
  id: number;
  userId: number;
  type: string;
  title: string;
  body: string;
  status: string;
  channel: string;
  createdAt: string | null;
  readAt: string | null;
}

interface NotificationPreferenceResource {
  notificationType: string;
  enabled: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificationsHttpService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}${environment.apiPrefix}`;

  /** GET /api/v1/notifications/user/{userId} */
  getNotifications(userId: number): Observable<Notification[]> {
    return this.http
      .get<NotificationResource[]>(`${this.baseUrl}/notifications/user/${userId}`)
      .pipe(map((resources) => resources.map(toNotification)));
  }

  /** GET /api/v1/notifications/user/{userId}/unread */
  getUnreadNotifications(userId: number): Observable<Notification[]> {
    return this.http
      .get<NotificationResource[]>(`${this.baseUrl}/notifications/user/${userId}/unread`)
      .pipe(map((resources) => resources.map(toNotification)));
  }

  /** PATCH /api/v1/notifications/{id}/read */
  markAsRead(notificationId: string): Observable<void> {
    return this.http.patch<void>(
      `${this.baseUrl}/notifications/${notificationId}/read`,
      {}
    );
  }

  /** Alias for ack — backend treats it the same as READ. */
  acknowledge(notificationId: string): Observable<void> {
    return this.markAsRead(notificationId);
  }

  /**
   * Backend has no DELETE/dismiss endpoint yet, so we mark as read and let the
   * store filter the notification from the inbox locally.
   */
  dismiss(notificationId: string): Observable<void> {
    return this.markAsRead(notificationId);
  }

  /** GET /api/v1/users/{userId}/notification-preferences */
  getPreferences(userId: number): Observable<NotificationPreference[]> {
    return this.http
      .get<NotificationPreferenceResource[]>(
        `${this.baseUrl}/users/${userId}/notification-preferences`
      )
      .pipe(map((resources) => resources.map(toPreference)));
  }

  /** PUT /api/v1/users/{userId}/notification-preferences */
  updatePreferences(
    userId: number,
    preferences: NotificationPreference[]
  ): Observable<NotificationPreference[]> {
    const payload = {
      preferences: preferences.map((p) => ({
        notificationType: p.notificationType,
        enabled: p.enabled,
      })),
    };
    return this.http
      .put<void>(`${this.baseUrl}/users/${userId}/notification-preferences`, payload)
      .pipe(map(() => preferences));
  }

  // -------------------------------------------------------------------------
  // System health & activity log: backend doesn't expose these endpoints yet.
  // Keeping client-side synthetic data so the panel keeps working until the
  // ops/observability endpoints are added.
  // -------------------------------------------------------------------------

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

  /** TODO: replace with /api/v1/operations/health-metrics when available. */
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

  /** TODO: replace with /api/v1/operations/activity-log when available. */
  getActivityLogs(): Observable<ActivityLogItem[]> {
    return of([...this.mockActivityLogs]).pipe(delay(200));
  }
}

function toNotification(resource: NotificationResource): Notification {
  const type = parseEnum<NotificationType>(resource.type, NotificationType.SYSTEM_ALERT);
  const status = parseEnum<NotificationStatus>(resource.status, NotificationStatus.DELIVERED);
  const channel = parseEnum<NotificationChannel>(resource.channel, NotificationChannel.IN_APP);
  const createdAt = resource.createdAt ?? new Date().toISOString();

  return {
    id: String(resource.id),
    userId: String(resource.userId),
    type,
    title: resource.title,
    body: resource.body,
    data: null,
    status,
    severity: severityFromNotificationType(type),
    channel,
    sentAt: createdAt,
    readAt: resource.readAt ?? undefined,
    createdAt,
    updatedAt: resource.readAt ?? createdAt,
  };
}

function toPreference(resource: NotificationPreferenceResource): NotificationPreference {
  const type = parseEnum<NotificationType>(resource.notificationType, NotificationType.SYSTEM_ALERT);
  return {
    notificationType: type,
    enabled: resource.enabled,
    locked: type === NotificationType.EMERGENCY_ALERT,
  };
}

function parseEnum<T extends string>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  return value as T;
}
