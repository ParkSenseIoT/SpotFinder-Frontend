import { Component, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { PaymentsStore } from '../../../application/store/payments.store';
import { PaymentMethod } from '../../../domain/enums/payment.enums';
import { PaymentStatusBadgeComponent } from '../payment-status-badge/payment-status-badge.component';

@Component({
  selector: 'app-payment-history-table',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, PaymentStatusBadgeComponent],
  template: `
    @if (store.paymentsError()) {
      <div class="inline-error">{{ store.paymentsError() }}</div>
    }
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Payment ID</th>
            <th>Session</th>
            <th>Amount</th>
            <th>Method</th>
            <th>Status</th>
            <th>Transaction ID</th>
            <th>Paid at</th>
            <th>Receipt</th>
          </tr>
        </thead>
        <tbody>
          @if (store.paymentsLoading() && store.payments().length === 0) {
            @for (s of skeletonRows; track s) {
              <tr class="skeleton-row">
                @for (c of skeletonCols; track c) {
                  <td><span class="sk"></span></td>
                }
              </tr>
            }
          } @else if (!store.paymentsLoading() && store.filteredPayments().length === 0) {
            <tr>
              <td colspan="8">
                <div class="empty-state">
                  <div class="icon-empty" aria-hidden="true">—</div>
                  <h4>No payments</h4>
                  <p>Adjust filters or refresh to load monitoring data.</p>
                </div>
              </td>
            </tr>
          } @else {
            @for (p of store.filteredPayments(); track p.id) {
              <tr>
                <td class="mono">{{ p.id }}</td>
                <td class="mono">{{ p.sessionId }}</td>
                <td class="bold">{{ p.amount | currency: p.currency:'symbol':'1.2-2' }}</td>
                <td>{{ formatMethod(p.paymentMethod) }}</td>
                <td><app-payment-status-badge [status]="p.status"></app-payment-status-badge></td>
                <td class="mono">{{ p.transactionId }}</td>
                <td class="mono">
                  @if (p.paidAt) {
                    {{ p.paidAt | date: 'MMM d, y HH:mm' }}
                  } @else {
                    —
                  }
                </td>
                <td>
                  @if (p.receiptUrl) {
                    <a class="link" [href]="p.receiptUrl" target="_blank" rel="noopener noreferrer">Open</a>
                  } @else {
                    <span class="muted">—</span>
                  }
                </td>
              </tr>
            }
          }
        </tbody>
      </table>
    </div>
  `,
  styleUrls: ['./payment-history-table.component.scss'],
})
export class PaymentHistoryTableComponent {
  readonly store = inject(PaymentsStore);
  readonly skeletonRows = [1, 2, 3, 4, 5];
  readonly skeletonCols = [1, 2, 3, 4, 5, 6, 7, 8];

  formatMethod(m: PaymentMethod): string {
    return m.replace(/_/g, ' ');
  }
}
