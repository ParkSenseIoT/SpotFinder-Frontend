import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  GenerateReportRequest,
  Payment,
  PaymentReport,
  RevenueAnalytics,
  RevenueByDayEntry,
  RevenueByMethodEntry,
} from '../../domain/models/payment.models';
import {
  PaymentMethod,
  PaymentReportFormat,
  PaymentReportStatus,
  PaymentStatus,
} from '../../domain/enums/payment.enums';
import { environment } from '../../../../environments/environment';

/**
 * Payments & revenue monitoring API seam.
 * Replace `of(...).pipe(delay())` with `HttpClient` calls when wiring the real backend.
 */
@Injectable({ providedIn: 'root' })
export class PaymentsHttpService {
  private readonly baseUrl = `${environment.apiBaseUrl}${environment.apiPrefix}`;

  private mockReports: PaymentReport[] = [
    {
      id: 'rpt-8841',
      name: 'Revenue summary — Q1 operations',
      format: PaymentReportFormat.PDF,
      status: PaymentReportStatus.READY,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
      downloadUrl: `${this.baseUrl}/payment-reports/rpt-8841/download`,
      sizeBytes: 482_000,
    },
    {
      id: 'rpt-8842',
      name: 'Transaction ledger — last 30 days',
      format: PaymentReportFormat.CSV,
      status: PaymentReportStatus.READY,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
      downloadUrl: `${this.baseUrl}/payment-reports/rpt-8842/download`,
      sizeBytes: 1_240_000,
    },
    {
      id: 'rpt-8843',
      name: 'Method mix — executive',
      format: PaymentReportFormat.PDF,
      status: PaymentReportStatus.GENERATING,
      createdAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
    },
    {
      id: 'rpt-8839',
      name: 'Failed payments audit',
      format: PaymentReportFormat.CSV,
      status: PaymentReportStatus.FAILED,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    },
    {
      id: 'rpt-8838',
      name: 'Compliance export — PCI scope',
      format: PaymentReportFormat.PDF,
      status: PaymentReportStatus.READY,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 200).toISOString(),
      downloadUrl: `${this.baseUrl}/payment-reports/rpt-8838/download`,
      sizeBytes: 320_000,
    },
  ];

  private mockPayments: Payment[] = buildMockPayments();

  /** GET /api/v1/analytics/revenue */
  getRevenueAnalytics(): Observable<RevenueAnalytics> {
    const analytics = computeRevenueFromPayments(this.mockPayments);
    const jitter = Math.round((Math.random() - 0.5) * 80);
    const next: RevenueAnalytics = {
      ...analytics,
      totalRevenue: Math.max(0, analytics.totalRevenue + jitter),
      averageTicket:
        analytics.totalTransactions > 0
          ? Math.round((analytics.totalRevenue + jitter) / analytics.totalTransactions * 100) / 100
          : 0,
    };
    return of(next).pipe(delay(420));
  }

  /** GET /api/v1/payments (admin / monitoring list; align path with backend) */
  listPayments(): Observable<Payment[]> {
    return of([...this.mockPayments]).pipe(delay(520));
  }

  /** GET /api/v1/payment-reports */
  listReports(): Observable<PaymentReport[]> {
    return of([...this.mockReports]).pipe(delay(360));
  }

  /** POST /api/v1/payment-reports/generate */
  generateReport(req: GenerateReportRequest): Observable<PaymentReport> {
    const id = `rpt-${Date.now().toString(36).toUpperCase()}`;
    const report: PaymentReport = {
      id,
      name: req.name,
      format: req.format,
      status: PaymentReportStatus.GENERATING,
      createdAt: new Date().toISOString(),
    };
    this.mockReports = [report, ...this.mockReports];
    return of(report).pipe(delay(480));
  }

  /** GET /api/v1/payment-reports/{id}/download — mock returns a Blob */
  downloadReport(reportId: string): Observable<Blob> {
    const r = this.mockReports.find((x) => x.id === reportId);
    if (!r) return throwError(() => new Error('Report not found'));
    if (r.status !== PaymentReportStatus.READY || !r.downloadUrl) {
      return throwError(() => new Error('Report not available for download'));
    }
    const text =
      `SpotFinder — ${r.name}\n` +
      `Report ID: ${r.id}\n` +
      `Generated (mock): ${new Date().toISOString()}\n`;
    const blob = new Blob([text], { type: r.format === PaymentReportFormat.CSV ? 'text/csv' : 'application/pdf' });
    return of(blob).pipe(delay(280));
  }

  /**
   * Simulated finalize for GENERATING reports (demo only).
   * Real backend would push status via polling or WebSocket.
   */
  simulateReportReady(reportId: string): void {
    this.mockReports = this.mockReports.map((r) =>
      r.id === reportId
        ? {
            ...r,
            status: PaymentReportStatus.READY,
            downloadUrl: `${this.baseUrl}/payment-reports/${reportId}/download`,
            sizeBytes: Math.floor(200_000 + Math.random() * 400_000),
          }
        : r
    );
  }

  /** Optional: nudge mock payments for live demo (called from store on poll). */
  applyDemoPaymentTick(): void {
    if (Math.random() > 0.65) return;
    const pendingIdx = this.mockPayments.findIndex((p) => p.status === PaymentStatus.PENDING);
    if (pendingIdx === -1) return;
    const p = this.mockPayments[pendingIdx]!;
    const settled: Payment = {
      ...p,
      status: Math.random() > 0.12 ? PaymentStatus.COMPLETED : PaymentStatus.FAILED,
      paidAt: new Date().toISOString(),
      transactionId:
        p.status === PaymentStatus.PENDING
          ? `TXN-SF-${Date.now().toString(36).toUpperCase()}`
          : p.transactionId,
      receiptUrl:
        Math.random() > 0.2
          ? `https://receipts.spotfinder.mock/${p.id}.pdf`
          : null,
    };
    this.mockPayments = this.mockPayments.map((x, i) => (i === pendingIdx ? settled : x));
  }
}

function buildMockPayments(): Payment[] {
  const currency = 'PEN';
  const now = Date.now();
  const iso = (offsetH: number) => new Date(now - offsetH * 3600_000).toISOString();

  const rows: Payment[] = [
    pay('pay-001', 'sess-A91', 18.5, currency, PaymentMethod.YAPE, PaymentStatus.COMPLETED, 'TXN-SF-8K2M9Q1', iso(2), '1h 15m', 1.25, 'usr-104'),
    pay('pay-002', 'sess-A88', 42.0, currency, PaymentMethod.CREDIT_CARD, PaymentStatus.COMPLETED, 'TXN-SF-7J3N2P0', iso(5), '3h 00m', 3.0, 'usr-221'),
    pay('pay-003', 'sess-B02', 12.0, currency, PaymentMethod.DEBIT_CARD, PaymentStatus.PENDING, 'TXN-SF-PENDING-01', null, null, null, 'usr-332'),
    pay('pay-004', 'sess-B07', 8.0, currency, PaymentMethod.YAPE, PaymentStatus.FAILED, 'TXN-SF-FAIL-8821', null, null, null, 'usr-104'),
    pay('pay-005', 'sess-C14', 55.75, currency, PaymentMethod.CREDIT_CARD, PaymentStatus.COMPLETED, 'TXN-SF-9L4R8T2', iso(8), '4h 30m', 4.5, 'usr-410'),
    pay('pay-006', 'sess-C19', 6.0, currency, PaymentMethod.YAPE, PaymentStatus.COMPLETED, 'TXN-SF-6H1W5Y9', iso(12), '0h 45m', 0.75, 'usr-512'),
    pay('pay-007', 'sess-D21', 24.0, currency, PaymentMethod.DEBIT_CARD, PaymentStatus.COMPLETED, 'TXN-SF-5G9X3V7', iso(18), '2h 00m', 2.0, 'usr-221'),
    pay('pay-008', 'sess-D22', 24.0, currency, PaymentMethod.CREDIT_CARD, PaymentStatus.PENDING, 'TXN-SF-PENDING-02', null, null, null, 'usr-633'),
    pay('pay-009', 'sess-E30', 36.25, currency, PaymentMethod.YAPE, PaymentStatus.COMPLETED, 'TXN-SF-4F8U2S6', iso(30), '2h 45m', 2.75, 'usr-104'),
    pay('pay-010', 'sess-E31', 15.0, currency, PaymentMethod.DEBIT_CARD, PaymentStatus.FAILED, 'TXN-SF-FAIL-7732', null, null, null, 'usr-701'),
    pay('pay-011', 'sess-F40', 9.5, currency, PaymentMethod.YAPE, PaymentStatus.COMPLETED, 'TXN-SF-3E7T1R5', iso(40), '1h 00m', 1.0, 'usr-512'),
    pay('pay-012', 'sess-F41', 48.0, currency, PaymentMethod.CREDIT_CARD, PaymentStatus.COMPLETED, 'TXN-SF-2D6S0Q4', iso(52), '5h 00m', 5.0, 'usr-221'),
    pay('pay-013', 'sess-G55', 11.25, currency, PaymentMethod.DEBIT_CARD, PaymentStatus.COMPLETED, 'TXN-SF-1C5R9P3', iso(70), '0h 50m', 0.83, 'usr-332'),
    pay('pay-014', 'sess-G56', 28.0, currency, PaymentMethod.YAPE, PaymentStatus.COMPLETED, 'TXN-SF-0B4Q8O2', iso(90), '2h 20m', 2.33, 'usr-410'),
    pay('pay-015', 'sess-H60', 33.5, currency, PaymentMethod.CREDIT_CARD, PaymentStatus.COMPLETED, 'TXN-SF-ZA3N7M1', iso(110), '2h 50m', 2.83, 'usr-633'),
    pay('pay-016', 'sess-H61', 7.5, currency, PaymentMethod.YAPE, PaymentStatus.PENDING, 'TXN-SF-PENDING-03', null, null, null, 'usr-701'),
    pay('pay-017', 'sess-J70', 19.0, currency, PaymentMethod.DEBIT_CARD, PaymentStatus.COMPLETED, 'TXN-SF-Y92L6K0', iso(140), '1h 30m', 1.5, 'usr-104'),
    pay('pay-018', 'sess-J71', 62.0, currency, PaymentMethod.CREDIT_CARD, PaymentStatus.COMPLETED, 'TXN-SF-X81K5J9', iso(180), '6h 10m', 6.17, 'usr-221'),
  ];

  return rows;
}

function pay(
  id: string,
  sessionId: string,
  amount: number,
  currency: string,
  method: PaymentMethod,
  status: PaymentStatus,
  transactionId: string,
  paidAt: string | null,
  duration: string | null,
  hoursCharged: number | null,
  userId: string
): Payment {
  return {
    id,
    sessionId,
    amount,
    currency,
    paymentMethod: method,
    status,
    transactionId,
    receiptUrl:
      status === PaymentStatus.COMPLETED
        ? `https://receipts.spotfinder.mock/${id}.pdf`
        : null,
    paidAt,
    duration,
    hoursCharged,
    userId,
  };
}

function computeRevenueFromPayments(payments: Payment[]): RevenueAnalytics {
  const completed = payments.filter((p) => p.status === PaymentStatus.COMPLETED);
  const totalRevenue = completed.reduce((s, p) => s + p.amount, 0);
  const totalTransactions = completed.length;
  const averageTicket =
    totalTransactions > 0 ? Math.round((totalRevenue / totalTransactions) * 100) / 100 : 0;

  const byMethodMap = new Map<PaymentMethod, { amount: number; count: number }>();
  for (const p of completed) {
    const cur = byMethodMap.get(p.paymentMethod) ?? { amount: 0, count: 0 };
    cur.amount += p.amount;
    cur.count += 1;
    byMethodMap.set(p.paymentMethod, cur);
  }
  const paymentsByMethod: RevenueByMethodEntry[] = (
    [PaymentMethod.YAPE, PaymentMethod.CREDIT_CARD, PaymentMethod.DEBIT_CARD] as PaymentMethod[]
  )
    .map((method) => {
      const v = byMethodMap.get(method);
      return { method, amount: v?.amount ?? 0, count: v?.count ?? 0 };
    })
    .filter((x) => x.count > 0);

  const dayMap = new Map<string, { revenue: number; transactionCount: number }>();
  for (const p of completed) {
    if (!p.paidAt) continue;
    const day = p.paidAt.slice(0, 10);
    const cur = dayMap.get(day) ?? { revenue: 0, transactionCount: 0 };
    cur.revenue += p.amount;
    cur.transactionCount += 1;
    dayMap.set(day, cur);
  }
  const dataByDay: RevenueByDayEntry[] = [...dayMap.entries()]
    .map(([date, v]) => ({ date, revenue: v.revenue, transactionCount: v.transactionCount }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Ensure chart-friendly series: fill last 21 calendar days from completed revenue
  const filled = fillLastDays(dataByDay, 21);

  return {
    totalRevenue,
    averageTicket,
    totalTransactions,
    paymentsByMethod,
    dataByDay: filled,
    currency: completed[0]?.currency ?? 'PEN',
  };
}

function fillLastDays(existing: RevenueByDayEntry[], days: number): RevenueByDayEntry[] {
  const map = new Map(existing.map((e) => [e.date, e]));
  const out: RevenueByDayEntry[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const hit = map.get(key);
    out.push(
      hit ?? {
        date: key,
        revenue: 0,
        transactionCount: 0,
      }
    );
  }
  return out;
}
