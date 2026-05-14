export enum NotificationType {
  EMERGENCY_ALERT = 'EMERGENCY_ALERT',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  PAYMENT_REMINDER = 'PAYMENT_REMINDER',
  ENTRY_CONFIRMED = 'ENTRY_CONFIRMED',
  SESSION_END = 'SESSION_END',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
}

/** Aligns with backend delivery lifecycle (no client-only pseudo-statuses). */
export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED',
}

export enum NotificationSeverity {
  CRITICAL = 'CRITICAL',
  WARNING = 'WARNING',
  SUCCESS = 'SUCCESS',
  INFO = 'INFO',
}

export enum NotificationChannel {
  PUSH = 'PUSH',
  IN_APP = 'IN_APP',
}
