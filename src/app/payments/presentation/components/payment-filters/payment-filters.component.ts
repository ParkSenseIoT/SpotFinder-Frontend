import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentsStore } from '../../../application/store/payments.store';
import { PaymentMethod, PaymentStatus } from '../../../domain/enums/payment.enums';

@Component({
  selector: 'app-payment-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="filters-panel">
      <div class="filters-row">
        <label class="field">
          <span>From</span>
          <input
            type="date"
            [ngModel]="store.filters().dateFrom ?? ''"
            (ngModelChange)="onDateFrom($event)"
          />
        </label>
        <label class="field">
          <span>To</span>
          <input
            type="date"
            [ngModel]="store.filters().dateTo ?? ''"
            (ngModelChange)="onDateTo($event)"
          />
        </label>
        <label class="field">
          <span>Method</span>
          <select
            [ngModel]="store.filters().method"
            (ngModelChange)="store.setFilters({ method: $event })">
            <option value="ALL">All methods</option>
            <option [value]="PaymentMethod.YAPE">Yape</option>
            <option [value]="PaymentMethod.CREDIT_CARD">Credit card</option>
            <option [value]="PaymentMethod.DEBIT_CARD">Debit card</option>
          </select>
        </label>
        <label class="field">
          <span>Status</span>
          <select
            [ngModel]="store.filters().status"
            (ngModelChange)="store.setFilters({ status: $event })">
            <option value="ALL">All statuses</option>
            <option [value]="PaymentStatus.PENDING">Pending</option>
            <option [value]="PaymentStatus.COMPLETED">Completed</option>
            <option [value]="PaymentStatus.FAILED">Failed</option>
          </select>
        </label>
        <label class="field field--grow">
          <span>Transaction ID</span>
          <input
            type="search"
            placeholder="Search by transaction id…"
            [ngModel]="store.filters().transactionQuery"
            (ngModelChange)="store.setFilters({ transactionQuery: $event })"
          />
        </label>
        <button type="button" class="btn-outline" (click)="store.resetFilters()">Reset</button>
      </div>
      <p class="hint">Filters apply on this workstation (client-side). Server-side filters can replace the filter util later.</p>
    </div>
  `,
  styleUrls: ['./payment-filters.component.scss'],
})
export class PaymentFiltersComponent {
  readonly store = inject(PaymentsStore);
  readonly PaymentMethod = PaymentMethod;
  readonly PaymentStatus = PaymentStatus;

  onDateFrom(v: string) {
    this.store.setFilters({ dateFrom: v ? v : null });
  }

  onDateTo(v: string) {
    this.store.setFilters({ dateTo: v ? v : null });
  }
}
