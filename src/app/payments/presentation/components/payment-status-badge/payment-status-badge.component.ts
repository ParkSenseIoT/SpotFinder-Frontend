import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentStatus } from '../../../domain/enums/payment.enums';

@Component({
  selector: 'app-payment-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `<span class="badge" [ngClass]="cssClass()">{{ status() }}</span>`,
  styleUrls: ['./payment-status-badge.component.scss'],
})
export class PaymentStatusBadgeComponent {
  readonly status = input.required<PaymentStatus>();

  cssClass(): string {
    switch (this.status()) {
      case PaymentStatus.COMPLETED:
        return 'badge--completed';
      case PaymentStatus.PENDING:
        return 'badge--pending';
      case PaymentStatus.FAILED:
        return 'badge--failed';
      default:
        return '';
    }
  }
}
