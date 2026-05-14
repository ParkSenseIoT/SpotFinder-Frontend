import {
  isActivitySystemType,
  isUnreadStatus,
  severityFromNotificationType,
} from './notification-display.utils';
import {
  NotificationSeverity,
  NotificationStatus,
  NotificationType,
} from '../enums/notification.enums';

describe('notification-display.utils', () => {
  describe('isUnreadStatus()', () => {
    it('treats PENDING, SENT and DELIVERED as unread (count for the topbar badge)', () => {
      expect(isUnreadStatus(NotificationStatus.PENDING)).toBeTrue();
      expect(isUnreadStatus(NotificationStatus.SENT)).toBeTrue();
      expect(isUnreadStatus(NotificationStatus.DELIVERED)).toBeTrue();
    });

    it('treats READ and FAILED as NOT unread', () => {
      expect(isUnreadStatus(NotificationStatus.READ)).toBeFalse();
      expect(isUnreadStatus(NotificationStatus.FAILED)).toBeFalse();
    });
  });

  describe('severityFromNotificationType()', () => {
    it('maps EMERGENCY_ALERT to CRITICAL', () => {
      expect(severityFromNotificationType(NotificationType.EMERGENCY_ALERT)).toBe(
        NotificationSeverity.CRITICAL
      );
    });

    it('maps PAYMENT_FAILED, PAYMENT_REMINDER and SYSTEM_ALERT to WARNING', () => {
      expect(severityFromNotificationType(NotificationType.PAYMENT_FAILED)).toBe(
        NotificationSeverity.WARNING
      );
      expect(severityFromNotificationType(NotificationType.PAYMENT_REMINDER)).toBe(
        NotificationSeverity.WARNING
      );
      expect(severityFromNotificationType(NotificationType.SYSTEM_ALERT)).toBe(
        NotificationSeverity.WARNING
      );
    });

    it('maps PAYMENT_SUCCESS to SUCCESS and operational events to INFO', () => {
      expect(severityFromNotificationType(NotificationType.PAYMENT_SUCCESS)).toBe(
        NotificationSeverity.SUCCESS
      );
      expect(severityFromNotificationType(NotificationType.ENTRY_CONFIRMED)).toBe(
        NotificationSeverity.INFO
      );
      expect(severityFromNotificationType(NotificationType.SESSION_END)).toBe(
        NotificationSeverity.INFO
      );
    });
  });

  describe('isActivitySystemType()', () => {
    it('returns true only for ENTRY_CONFIRMED, SESSION_END and SYSTEM_ALERT (Activity feed)', () => {
      expect(isActivitySystemType(NotificationType.ENTRY_CONFIRMED)).toBeTrue();
      expect(isActivitySystemType(NotificationType.SESSION_END)).toBeTrue();
      expect(isActivitySystemType(NotificationType.SYSTEM_ALERT)).toBeTrue();

      expect(isActivitySystemType(NotificationType.EMERGENCY_ALERT)).toBeFalse();
      expect(isActivitySystemType(NotificationType.PAYMENT_SUCCESS)).toBeFalse();
    });
  });
});
