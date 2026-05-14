import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PaymentsStore } from '../../../application/store/payments.store';
import { PaymentReportFormat, PaymentReportStatus } from '../../../domain/enums/payment.enums';

@Component({
  selector: 'app-reports-panel',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="reports-panel">
      <div class="reports-header">
        <div>
          <h3>Reports</h3>
          <p class="sub">Generate and download operator exports (mock pipeline).</p>
        </div>
        <div class="actions">
          <button type="button" class="btn-outline" (click)="gen(PaymentReportFormat.PDF)">Generate PDF</button>
          <button type="button" class="btn-outline" (click)="gen(PaymentReportFormat.CSV)">Generate CSV</button>
        </div>
      </div>
      @if (store.reportsError()) {
        <div class="inline-error">{{ store.reportsError() }}</div>
      }
      <div class="reports-list">
        @if (store.reportsLoading() && store.reports().length === 0) {
          @for (i of [1, 2, 3]; track i) {
            <div class="report-row skeleton">
              <span class="sk w-30"></span>
              <span class="sk w-20"></span>
              <span class="sk w-15"></span>
            </div>
          }
        } @else if (!store.reportsLoading() && store.reports().length === 0) {
          <div class="empty-state">
            <div class="icon-empty" aria-hidden="true">—</div>
            <h4>No reports yet</h4>
            <p>Queue a report to see it listed here.</p>
          </div>
        } @else {
          @for (r of store.reports(); track r.id) {
            <div class="report-row">
              <div class="meta">
                <span class="name">{{ r.name }}</span>
                <span class="mono">{{ r.id }} · {{ r.format }}</span>
              </div>
              <span class="badge" [ngClass]="reportClass(r.status)">{{ r.status }}</span>
              <span class="mono date">{{ r.createdAt | date: 'MMM d, y HH:mm' }}</span>
              <div class="row-actions">
                <button
                  type="button"
                  class="btn-text"
                  [disabled]="r.status !== PaymentReportStatus.READY || !r.downloadUrl"
                  (click)="store.downloadReport(r.id)">
                  Download
                </button>
              </div>
            </div>
          }
        }
      </div>
    </div>
  `,
  styleUrls: ['./reports-panel.component.scss'],
})
export class ReportsPanelComponent {
  readonly store = inject(PaymentsStore);
  readonly PaymentReportFormat = PaymentReportFormat;
  readonly PaymentReportStatus = PaymentReportStatus;

  gen(format: PaymentReportFormat) {
    const stamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
    this.store.generateReport({
      name: `Operator export — ${stamp}`,
      format,
      dateFrom: this.store.filters().dateFrom,
      dateTo: this.store.filters().dateTo,
    });
  }

  reportClass(s: PaymentReportStatus): string {
    switch (s) {
      case PaymentReportStatus.READY:
        return 'badge--ready';
      case PaymentReportStatus.GENERATING:
        return 'badge--gen';
      case PaymentReportStatus.FAILED:
        return 'badge--fail';
      default:
        return '';
    }
  }
}
