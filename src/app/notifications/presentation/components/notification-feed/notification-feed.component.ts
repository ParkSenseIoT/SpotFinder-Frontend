import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationCardComponent } from '../notification-card/notification-card.component';
import { NotificationsStore, NotificationInboxFilter } from '../../../application/store/notifications.store';

@Component({
  selector: 'app-notification-feed',
  standalone: true,
  imports: [CommonModule, NotificationCardComponent],
  template: `
    <div class="feed-container">
      <div class="feed-header">
        <h3>Inbox</h3>
        <div class="toggle-group">
          <button type="button" [class.active]="store.filter() === 'ALL'" (click)="set('ALL')">All</button>
          <button type="button" [class.active]="store.filter() === 'UNREAD'" (click)="set('UNREAD')">
            Unread
            @if (store.unreadCount() > 0) {
              <span class="badge">{{ store.unreadCount() }}</span>
            }
          </button>
          <button type="button" [class.active]="store.filter() === 'EMERGENCY'" (click)="set('EMERGENCY')">
            Emergency
          </button>
          <button type="button" [class.active]="store.filter() === 'PAYMENTS'" (click)="set('PAYMENTS')">
            Payments
          </button>
          <button type="button" [class.active]="store.filter() === 'ACTIVITY'" (click)="set('ACTIVITY')">
            Activity / system
          </button>
        </div>
      </div>

      <div class="feed-list">
        @if (store.isLoading()) {
          <div class="loading-state">
            <span class="spinner"></span>
            Loading notifications…
          </div>
        } @else if (store.filteredNotifications().length === 0) {
          <div class="empty-state">
            <div class="icon-empty" aria-hidden="true">—</div>
            <h4>No notifications</h4>
            <p>Nothing matches this filter.</p>
          </div>
        } @else {
          @for (notification of store.filteredNotifications(); track notification.id) {
            <app-notification-card
              [notification]="notification"
              (markAsRead)="store.markAsRead($event)"
              (acknowledge)="store.acknowledge($event)"
              (dismiss)="store.dismiss($event)"
              (operationalAction)="store.recordOperationalAction($event)">
            </app-notification-card>
          }
        }
      </div>
    </div>
  `,
  styleUrls: ['./notification-feed.component.scss'],
})
export class NotificationFeedComponent {
  readonly store = inject(NotificationsStore);

  set(filter: NotificationInboxFilter) {
    this.store.setFilter(filter);
  }
}
