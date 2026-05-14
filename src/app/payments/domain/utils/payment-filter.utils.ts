import { Payment } from '../models/payment.models';
import { PaymentsUiFilters } from '../models/payment-filters.model';

function dayStartMs(isoDate: string): number {
  const d = new Date(isoDate + 'T00:00:00');
  return d.getTime();
}

function dayEndMs(isoDate: string): number {
  const d = new Date(isoDate + 'T23:59:59.999');
  return d.getTime();
}

function paymentSortTime(p: Payment): number {
  if (p.paidAt) return new Date(p.paidAt).getTime();
  return 0;
}

/**
 * Client-side filter pipeline. Swap this for server-driven filtering later
 * without changing components.
 */
export function applyPaymentFilters(payments: Payment[], filters: PaymentsUiFilters): Payment[] {
  const q = filters.transactionQuery.trim().toLowerCase();

  return payments.filter((p) => {
    if (filters.method !== 'ALL' && p.paymentMethod !== filters.method) {
      return false;
    }
    if (filters.status !== 'ALL' && p.status !== filters.status) {
      return false;
    }
    if (q && !p.transactionId.toLowerCase().includes(q)) {
      return false;
    }

    if (filters.dateFrom || filters.dateTo) {
      const fromMs = filters.dateFrom ? dayStartMs(filters.dateFrom) : -Infinity;
      const toMs = filters.dateTo ? dayEndMs(filters.dateTo) : Infinity;

      if (p.paidAt) {
        const t = new Date(p.paidAt).getTime();
        if (t < fromMs || t > toMs) return false;
      } else {
        return false;
      }
    }

    return true;
  }).sort((a, b) => paymentSortTime(b) - paymentSortTime(a));
}
