import { Component, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { PaymentsStore } from '../../../application/store/payments.store';

@Component({
  selector: 'app-revenue-summary-cards',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  template: `
    @if (store.revenueError()) {
      <div class="inline-error">{{ store.revenueError() }}</div>
    }
    @if (store.revenue(); as rev) {
      <div class="kpi-row">
        <div class="kpi-card">
          <div class="kpi-header">
            <span>Total revenue</span>
            <span class="icon cyan">Σ</span>
          </div>
          <div class="kpi-main">
            <h2>{{ rev.totalRevenue | currency: rev.currency:'symbol':'1.2-2' }}</h2>
          </div>
          <div class="kpi-footer">
            <p>Window: analytics service · mock data</p>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-header">
            <span>Average ticket</span>
            <span class="icon cyan">x̄</span>
          </div>
          <div class="kpi-main">
            <h2>{{ rev.averageTicket | currency: rev.currency:'symbol':'1.2-2' }}</h2>
          </div>
          <div class="kpi-footer">
            <p>Per completed transaction</p>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-header">
            <span>Transactions</span>
            <span class="icon cyan">#</span>
          </div>
          <div class="kpi-main">
            <h2>{{ rev.totalTransactions | number }}</h2>
          </div>
          <div class="kpi-footer">
            <p>Completed payments in scope</p>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-header">
            <span>Reporting currency</span>
            <span class="icon cyan">¤</span>
          </div>
          <div class="kpi-main">
            <h2 class="mono">{{ rev.currency }}</h2>
          </div>
          <div class="kpi-footer">
            <p>Aligned with GET /api/v1/analytics/revenue</p>
          </div>
        </div>
      </div>
    } @else if (store.revenueLoading()) {
      <div class="kpi-row">
        @for (i of [1, 2, 3, 4]; track i) {
          <div class="kpi-card skeleton-card">
            <div class="skeleton-line w-40"></div>
            <div class="skeleton-line w-70 h-lg mt"></div>
            <div class="skeleton-line w-90 mt"></div>
          </div>
        }
      </div>
    }
  `,
  styleUrls: ['./revenue-summary-cards.component.scss'],
})
export class RevenueSummaryCardsComponent {
  readonly store = inject(PaymentsStore);
}
