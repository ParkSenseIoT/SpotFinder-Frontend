import { NotificationSeverity, NotificationStatus, NotificationType } from '../enums/notification.enums';

/** Inbox states that should surface as unread in UI and topbar badge. */
export function isUnreadStatus(status: NotificationStatus): boolean {
  return (
    status === NotificationStatus.PENDING ||
    status === NotificationStatus.SENT ||
    status === NotificationStatus.DELIVERED
  );
}

/** Default severity when mapping backend notification types to UI treatment. */
export function severityFromNotificationType(type: NotificationType): NotificationSeverity {
  switch (type) {
    case NotificationType.EMERGENCY_ALERT:
      return NotificationSeverity.CRITICAL;
    case NotificationType.PAYMENT_FAILED:
      return NotificationSeverity.WARNING;
    case NotificationType.PAYMENT_REMINDER:
      return NotificationSeverity.WARNING;
    case NotificationType.PAYMENT_SUCCESS:
      return NotificationSeverity.SUCCESS;
    case NotificationType.ENTRY_CONFIRMED:
    case NotificationType.SESSION_END:
      return NotificationSeverity.INFO;
    case NotificationType.SYSTEM_ALERT:
      return NotificationSeverity.WARNING;
    default:
      return NotificationSeverity.INFO;
  }
}

export function isActivitySystemType(type: NotificationType): boolean {
  return (
    type === NotificationType.ENTRY_CONFIRMED ||
    type === NotificationType.SESSION_END ||
    type === NotificationType.SYSTEM_ALERT
  );
}
