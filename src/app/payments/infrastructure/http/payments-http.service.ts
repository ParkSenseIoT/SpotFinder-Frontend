import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
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
import { TokenStorageService } from '../../../iam/infrastructure/storage/token-storage.service';

interface PaymentResource {
  id: number;
  sessionId: number;
  amount: number | string;
  currency: string;
  paymentMethod: string;
  status: string;
  transactionId: string | null;
  receiptUrl: string | null;
  paidAt: string | null;
  duration: string | null;
  hoursCharged: number;
}

interface RevenueMetricsResource {
  totalRevenue: number | string;
  averageTicket: number | string;
  totalTransactions: number;
  paymentsByMethod: Record<string, number | string>;
  dataByDay: Record<string, number | string>;
  currency: string;
}

interface ReportResource {
  id: number;
  reportType: string;
  periodStart: string | null;
  periodEnd: string | null;
  generatedAt: string | null;
  status: string | null;
  fileUrl: string | null;
  facilityId: number | null;
}

@Injectable({ providedIn: 'root' })
export class PaymentsHttpService {
  private readonly http = inject(HttpClient);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly baseUrl = `${environment.apiBaseUrl}${environment.apiPrefix}`;

  /** GET /api/v1/analytics/revenue */
  getRevenueAnalytics(): Observable<RevenueAnalytics> {
    return this.http
      .get<RevenueMetricsResource>(`${this.baseUrl}/analytics/revenue`)
      .pipe(map((res) => toRevenueAnalytics(res)));
  }

  /**
   * GET /api/v1/payments/history?userId={id}
   *
   * NOTE: backend only exposes per-user history. There's no admin-wide listing
   * endpoint yet — when one is added (e.g. `GET /api/v1/payments`), swap this.
   */
  listPayments(): Observable<Payment[]> {
    const userId = this.resolveUserId();
    let params = new HttpParams();
    if (userId !== null) params = params.set('userId', userId.toString());
    return this.http
      .get<PaymentResource[]>(`${this.baseUrl}/payments/history`, { params })
      .pipe(map((rows) => rows.map(toPayment)));
  }

  /** GET /api/v1/reports */
  listReports(): Observable<PaymentReport[]> {
    return this.http
      .get<ReportResource[]>(`${this.baseUrl}/reports`)
      .pipe(map((rows) => rows.map((r) => toPaymentReport(r, this.baseUrl))));
  }

  /** POST /api/v1/reports */
  generateReport(req: GenerateReportRequest): Observable<PaymentReport> {
    const user = this.tokenStorage.getUser();
    const payload = {
      reportType: 'REVENUE',
      startDate: req.dateFrom ?? null,
      endDate: req.dateTo ?? null,
      generatedBy: user?.id ?? null,
      facilityId: null,
    };
    return this.http
      .post<ReportResource>(`${this.baseUrl}/reports`, payload)
      .pipe(map((r) => toPaymentReport({ ...r, reportType: req.name }, this.baseUrl)));
  }

  /** GET /api/v1/reports/{id}/download */
  downloadReport(reportId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/reports/${reportId}/download`, {
      responseType: 'blob',
    });
  }

  private resolveUserId(): number | null {
    const user = this.tokenStorage.getUser();
    const id = Number(user?.id);
    return Number.isFinite(id) && id > 0 ? id : null;
  }
}

function toPayment(resource: PaymentResource): Payment {
  return {
    id: String(resource.id),
    sessionId: String(resource.sessionId),
    amount: numberFromAny(resource.amount),
    currency: resource.currency ?? 'PEN',
    paymentMethod: parseEnum<PaymentMethod>(resource.paymentMethod, PaymentMethod.YAPE),
    status: parseEnum<PaymentStatus>(resource.status, PaymentStatus.PENDING),
    transactionId: resource.transactionId ?? '',
    receiptUrl: resource.receiptUrl,
    paidAt: resource.paidAt,
    duration: resource.duration,
    hoursCharged: resource.hoursCharged ?? null,
    userId: '',
  };
}

function toRevenueAnalytics(res: RevenueMetricsResource): RevenueAnalytics {
  const paymentsByMethod: RevenueByMethodEntry[] = Object.entries(res.paymentsByMethod ?? {})
    .map(([method, amount]) => ({
      method: parseEnum<PaymentMethod>(method, PaymentMethod.YAPE),
      amount: numberFromAny(amount),
      count: 0,
    }))
    .filter((entry) => entry.amount > 0);

  const dataByDay: RevenueByDayEntry[] = Object.entries(res.dataByDay ?? {})
    .map(([date, revenue]) => ({
      date,
      revenue: numberFromAny(revenue),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalRevenue: numberFromAny(res.totalRevenue),
    averageTicket: numberFromAny(res.averageTicket),
    totalTransactions: res.totalTransactions ?? 0,
    paymentsByMethod,
    dataByDay,
    currency: res.currency ?? 'PEN',
  };
}

function toPaymentReport(resource: ReportResource, baseUrl: string): PaymentReport {
  const status = mapReportStatus(resource.status, resource.fileUrl);
  return {
    id: String(resource.id),
    name: resource.reportType ?? `Report ${resource.id}`,
    format: PaymentReportFormat.PDF,
    status,
    createdAt: resource.generatedAt ?? new Date().toISOString(),
    downloadUrl:
      status === PaymentReportStatus.READY
        ? `${baseUrl}/reports/${resource.id}/download`
        : undefined,
  };
}

function mapReportStatus(status: string | null, fileUrl: string | null): PaymentReportStatus {
  const upper = status?.toUpperCase();
  if (upper === 'FAILED') return PaymentReportStatus.FAILED;
  if (upper === 'READY' || fileUrl) return PaymentReportStatus.READY;
  return PaymentReportStatus.GENERATING;
}

function parseEnum<T extends string>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  return value as T;
}

function numberFromAny(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}
