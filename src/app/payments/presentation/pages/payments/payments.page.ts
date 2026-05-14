import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { NGX_ECHARTS_CONFIG } from 'ngx-echarts';
import { PaymentsStore } from '../../../application/store/payments.store';
import { RevenueSummaryCardsComponent } from '../../components/revenue-summary-cards/revenue-summary-cards.component';
import { RevenueChartComponent } from '../../components/revenue-chart/revenue-chart.component';
import { PaymentMethodChartComponent } from '../../components/payment-method-chart/payment-method-chart.component';
import { PaymentFiltersComponent } from '../../components/payment-filters/payment-filters.component';
import { PaymentHistoryTableComponent } from '../../components/payment-history-table/payment-history-table.component';
import { ReportsPanelComponent } from '../../components/reports-panel/reports-panel.component';

@Component({
  selector: 'app-payments-page',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    RevenueSummaryCardsComponent,
    RevenueChartComponent,
    PaymentMethodChartComponent,
    PaymentFiltersComponent,
    PaymentHistoryTableComponent,
    ReportsPanelComponent,
  ],
  providers: [
    PaymentsStore,
    {
      provide: NGX_ECHARTS_CONFIG,
      useFactory: () => ({
        echarts: () => import('echarts'),
      }),
    },
  ],
  template: `
    <div class="payments-dashboard">
      <div class="dashboard-header">
        <div>
          <h2 class="page-title">Payments monitoring</h2>
          <p class="page-subtitle">
            Revenue analytics, transaction history, and operator reports — dashboard scope only.
          </p>
          @if (store.lastSyncedAt()) {
            <p class="sync-line mono">Last sync: {{ store.lastSyncedAt() | date: 'medium' }}</p>
          }
        </div>
        <div class="header-actions">
          <button type="button" class="btn-outline" (click)="store.refreshAll()" [disabled]="isRefreshing()">
            Refresh
          </button>
          <div class="toggle-group" role="group" aria-label="Auto refresh">
            <button
              type="button"
              [class.active]="store.autoRefreshActive()"
              (click)="toggleAuto()">
              Auto-refresh {{ store.autoRefreshActive() ? 'on' : 'off' }}
            </button>
          </div>
        </div>
      </div>

      <app-revenue-summary-cards></app-revenue-summary-cards>

      <div class="dashboard-content">
        <div class="main-column">
          <div class="panel chart-panel">
            <div class="panel-header">
              <h3>Revenue by day</h3>
              <span class="tag mono">dataByDay</span>
            </div>
            <app-revenue-chart></app-revenue-chart>
          </div>

          <div class="panel feed-panel">
            <div class="panel-header">
              <h3>Payment history</h3>
              <span class="legend mono">{{ store.filteredPayments().length }} visible</span>
            </div>
            <app-payment-filters></app-payment-filters>
            <div class="table-wrap">
              <app-payment-history-table></app-payment-history-table>
            </div>
          </div>
        </div>

        <div class="side-column">
          <div class="panel chart-panel chart-panel--compact">
            <div class="panel-header">
              <h3>Method mix</h3>
              <span class="tag mono">paymentsByMethod</span>
            </div>
            <app-payment-method-chart></app-payment-method-chart>
          </div>

          <app-reports-panel></app-reports-panel>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./payments.page.scss'],
})
export class PaymentsPage {
  readonly store = inject(PaymentsStore);

  isRefreshing(): boolean {
    return this.store.revenueLoading() && this.store.paymentsLoading() && this.store.reportsLoading();
  }

  toggleAuto(): void {
    if (this.store.autoRefreshActive()) {
      this.store.stopAutoRefresh();
    } else {
      this.store.startAutoRefresh();
    }
  }
}
