import { computed, inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState, withComputed, withHooks } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, interval, filter, map } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { NotificationsHttpService } from '../../infrastructure/http/notifications-http.service';
import { Notification, ActivityLogItem, NotificationPreference, SystemHealthMetric } from '../../domain/models/notification.models';
import { NotificationStatus, NotificationType, NotificationChannel } from '../../domain/enums/notification.enums';
import {
  isActivitySystemType,
  isUnreadStatus,
  severityFromNotificationType,
} from '../../domain/utils/notification-display.utils';
import { TokenStorageService } from '../../../iam/infrastructure/storage/token-storage.service';
import { environment } from '../../../../environments/environment';

const FALLBACK_USER_ID = 1;

export type NotificationInboxFilter = 'ALL' | 'UNREAD' | 'EMERGENCY' | 'PAYMENTS' | 'ACTIVITY';

interface NotificationsState {
  notifications: Notification[];
  activityLogs: ActivityLogItem[];
  systemHealth: SystemHealthMetric[];
  preferences: NotificationPreference[];
  filter: NotificationInboxFilter;
  userId: number;
  isLoading: boolean;
  isRealtimeActive: boolean;
}

const initialState: NotificationsState = {
  notifications: [],
  activityLogs: [],
  systemHealth: [],
  preferences: [],
  filter: 'ALL',
  userId: FALLBACK_USER_ID,
  isLoading: false,
  isRealtimeActive: false,
};

const SIMULATION_TYPES: NotificationType[] = [
  NotificationType.ENTRY_CONFIRMED,
  NotificationType.PAYMENT_SUCCESS,
  NotificationType.PAYMENT_REMINDER,
  NotificationType.SESSION_END,
  NotificationType.SYSTEM_ALERT,
  NotificationType.PAYMENT_FAILED,
  NotificationType.EMERGENCY_ALERT,
];

const SIMULATION_TITLES: Partial<Record<NotificationType, string>> = {
  [NotificationType.EMERGENCY_ALERT]: 'Perimeter breach signal',
  [NotificationType.ENTRY_CONFIRMED]: 'Gate authorization',
  [NotificationType.PAYMENT_SUCCESS]: 'Payment settled',
  [NotificationType.PAYMENT_FAILED]: 'Payment declined',
  [NotificationType.PAYMENT_REMINDER]: 'Balance reminder',
  [NotificationType.SESSION_END]: 'Session closed',
  [NotificationType.SYSTEM_ALERT]: 'Infrastructure notice',
};

export const NotificationsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ notifications, filter }) => ({
    unreadCount: computed(() => notifications().filter((n) => isUnreadStatus(n.status)).length),
    filteredNotifications: computed(() => {
      const all = notifications();
      switch (filter()) {
        case 'UNREAD':
          return all.filter((n) => isUnreadStatus(n.status));
        case 'EMERGENCY':
          return all.filter((n) => n.type === NotificationType.EMERGENCY_ALERT);
        case 'PAYMENTS':
          return all.filter(
            (n) =>
              n.type === NotificationType.PAYMENT_SUCCESS ||
              n.type === NotificationType.PAYMENT_FAILED ||
              n.type === NotificationType.PAYMENT_REMINDER
          );
        case 'ACTIVITY':
          return all.filter((n) => isActivitySystemType(n.type));
        case 'ALL':
        default:
          return all;
      }
    }),
  })),
  withMethods((store, service = inject(NotificationsHttpService), tokenStorage = inject(TokenStorageService)) => ({
    setFilter(filter: NotificationInboxFilter) {
      patchState(store, { filter });
    },

    resolveUserId() {
      const user = tokenStorage.getUser();
      const id = Number(user?.id);
      const userId = Number.isFinite(id) && id > 0 ? id : FALLBACK_USER_ID;
      patchState(store, { userId });
    },

    loadAll: rxMethod<number>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap((userId) =>
          service.getNotifications(userId).pipe(
            tapResponse({
              next: (notifications) => patchState(store, { notifications, isLoading: false }),
              error: () => patchState(store, { isLoading: false }),
            })
          )
        )
      )
    ),

    loadSystemHealth: rxMethod<void>(
      pipe(
        switchMap(() =>
          service.getSystemHealth().pipe(
            tapResponse({
              next: (systemHealth) => patchState(store, { systemHealth }),
              error: () => undefined,
            })
          )
        )
      )
    ),

    loadActivityLogs: rxMethod<void>(
      pipe(
        switchMap(() =>
          service.getActivityLogs().pipe(
            tapResponse({
              next: (activityLogs) => patchState(store, { activityLogs }),
              error: () => undefined,
            })
          )
        )
      )
    ),

    loadPreferences: rxMethod<number>(
      pipe(
        switchMap((userId) =>
          service.getPreferences(userId).pipe(
            tapResponse({
              next: (preferences) => patchState(store, { preferences }),
              error: () => undefined,
            })
          )
        )
      )
    ),

    setPreferenceEnabled: rxMethod<{ type: NotificationType; enabled: boolean }>(
      pipe(
        map(({ type, enabled }) => {
          const next = store.preferences().map((p) =>
            p.notificationType === type ? { ...p, enabled } : p
          );
          return { userId: store.userId(), preferences: next };
        }),
        switchMap(({ userId, preferences }) =>
          service.updatePreferences(userId, preferences).pipe(
            tapResponse({
              next: (saved) => patchState(store, { preferences: saved }),
              error: () => undefined,
            })
          )
        )
      )
    ),

    markAsRead: rxMethod<string>(
      pipe(
        switchMap((id) =>
          service.markAsRead(id).pipe(
            tapResponse({
              next: () => {
                patchState(store, (state) => ({
                  notifications: state.notifications.map((n) =>
                    n.id === id
                      ? { ...n, status: NotificationStatus.READ, readAt: new Date().toISOString() }
                      : n
                  ),
                }));
              },
              error: () => undefined,
            })
          )
        )
      )
    ),

    acknowledge: rxMethod<string>(
      pipe(
        switchMap((id) =>
          service.acknowledge(id).pipe(
            tapResponse({
              next: () => {
                patchState(store, (state) => ({
                  notifications: state.notifications.map((n) =>
                    n.id === id
                      ? { ...n, status: NotificationStatus.READ, readAt: new Date().toISOString() }
                      : n
                  ),
                }));
              },
              error: () => undefined,
            })
          )
        )
      )
    ),

    dismiss: rxMethod<string>(
      pipe(
        switchMap((id) =>
          service.dismiss(id).pipe(
            tapResponse({
              next: () => {
                patchState(store, (state) => ({
                  notifications: state.notifications.filter((n) => n.id !== id),
                }));
              },
              error: () => undefined,
            })
          )
        )
      )
    ),

    recordOperationalAction(event: { notificationId: string; title: string; message: string }) {
      const entry: ActivityLogItem = {
        id: `op-${Date.now()}`,
        title: event.title,
        message: event.message,
        timestamp: new Date().toISOString(),
        status: 'info',
      };
      patchState(store, (state) => ({
        activityLogs: [entry, ...state.activityLogs].slice(0, 50),
      }));
    },

    /**
     * Synthetic stream for the operational panel until WebSocket / SSE is wired up.
     * Disabled in production builds via environment.enableRealtimeMock.
     */
    startRealtimeSimulation: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isRealtimeActive: true })),
        switchMap(() =>
          interval(8000).pipe(
            filter(() => store.isRealtimeActive() && environment.enableRealtimeMock),
            tap(() => {
              const nonEmergency = SIMULATION_TYPES.filter(
                (t) => t !== NotificationType.EMERGENCY_ALERT
              );
              const ts = Date.now();

              if (Math.random() > 0.45) {
                const isEmergency = Math.random() > 0.92;
                const safeType = isEmergency
                  ? NotificationType.EMERGENCY_ALERT
                  : nonEmergency[Math.floor(Math.random() * nonEmergency.length)]!;
                const title = SIMULATION_TITLES[safeType] ?? 'Operational update';
                const gate = Math.floor(Math.random() * 5) + 1;
                const newNotif: Notification = {
                  id: `notif-live-${ts}`,
                  userId: String(store.userId()),
                  type: safeType,
                  title,
                  body:
                    safeType === NotificationType.EMERGENCY_ALERT
                      ? 'Automated perimeter check reported an anomaly — verify CCTV stream.'
                      : safeType === NotificationType.ENTRY_CONFIRMED
                        ? `Vehicle authorized at gate ${gate}.`
                        : `Synthetic event for ${safeType.replace(/_/g, ' ').toLowerCase()}.`,
                  data:
                    safeType === NotificationType.ENTRY_CONFIRMED
                      ? { gate: `G${gate}` }
                      : { source: 'simulation' },
                  status: NotificationStatus.DELIVERED,
                  severity: severityFromNotificationType(safeType),
                  channel: NotificationChannel.IN_APP,
                  sentAt: new Date().toISOString(),
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                };
                patchState(store, (state) => ({
                  notifications: [newNotif, ...state.notifications],
                }));
              }

              const logTemplates: ActivityLogItem[] = [
                {
                  id: `act-live-${ts}-a`,
                  title: 'Telemetry batch',
                  message: `Committed ${(Math.random() * 4 + 1).toFixed(1)}k events to cold store.`,
                  timestamp: new Date().toISOString(),
                  status: 'success',
                },
                {
                  id: `act-live-${ts}-b`,
                  title: 'Edge ping',
                  message: `Sector ${['A', 'B', 'C'][Math.floor(Math.random() * 3)]} latency ${(20 + Math.random() * 40).toFixed(0)}ms.`,
                  timestamp: new Date().toISOString(),
                  status: 'info',
                },
                {
                  id: `act-live-${ts}-c`,
                  title: 'Scheduler',
                  message: 'Compaction job queued for next maintenance window.',
                  timestamp: new Date().toISOString(),
                  status: 'warning',
                },
              ];
              const newLog = logTemplates[Math.floor(Math.random() * logTemplates.length)];
              patchState(store, (state) => ({
                activityLogs: [newLog, ...state.activityLogs].slice(0, 50),
              }));
            }),
            switchMap(() =>
              service.getSystemHealth().pipe(
                tap((health) => patchState(store, { systemHealth: health }))
              )
            )
          )
        )
      )
    ),

    stopRealtimeSimulation() {
      patchState(store, { isRealtimeActive: false });
    },
  })),
  withHooks({
    onInit(store) {
      store.resolveUserId();
      const userId = store.userId();
      store.loadAll(userId);
      store.loadSystemHealth();
      store.loadActivityLogs();
      store.loadPreferences(userId);
      if (environment.enableRealtimeMock) {
        store.startRealtimeSimulation();
      }
    },
    onDestroy(store) {
      store.stopRealtimeSimulation();
    },
  })
);
