import { NotificationType, NotificationStatus, NotificationSeverity, NotificationChannel } from '../enums/notification.enums';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data: any; // Additional payload, depends on type
  status: NotificationStatus;
  severity: NotificationSeverity;
  channel: NotificationChannel;
  sentAt: string;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPreference {
  notificationType: NotificationType;
  enabled: boolean;
  locked?: boolean; // For always-enabled types like emergencies
}

export interface SystemHealthMetric {
  id: string;
  name: string;
  value: number | string;
  unit: string;
  status: 'online' | 'warning' | 'offline';
  trend?: 'up' | 'down' | 'stable';
  lastUpdated: string;
}

export interface ActivityLogItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'info';
}
