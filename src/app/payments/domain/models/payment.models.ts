import {
  PaymentMethod,
  PaymentReportFormat,
  PaymentReportStatus,
  PaymentStatus,
} from '../enums/payment.enums';

/** Domain / API-aligned payment row (monitoring). */
export interface Payment {
  id: string;
  sessionId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionId: string;
  receiptUrl: string | null;
  paidAt: string | null;
  duration: string | null;
  hoursCharged: number | null;
  userId: string;
}

/** Response shape for GET /api/v1/analytics/revenue */
export interface RevenueByMethodEntry {
  method: PaymentMethod;
  amount: number;
  count: number;
}

export interface RevenueByDayEntry {
  date: string;
  revenue: number;
  transactionCount?: number;
}

export interface RevenueAnalytics {
  totalRevenue: number;
  averageTicket: number;
  totalTransactions: number;
  paymentsByMethod: RevenueByMethodEntry[];
  dataByDay: RevenueByDayEntry[];
  currency: string;
}

export interface PaymentReport {
  id: string;
  name: string;
  format: PaymentReportFormat;
  status: PaymentReportStatus;
  createdAt: string;
  downloadUrl?: string;
  sizeBytes?: number;
}

export interface GenerateReportRequest {
  name: string;
  format: PaymentReportFormat;
  /** Optional ISO range for report window */
  dateFrom?: string | null;
  dateTo?: string | null;
}
