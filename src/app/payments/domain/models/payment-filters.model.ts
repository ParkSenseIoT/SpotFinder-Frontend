import { PaymentMethod, PaymentStatus } from '../enums/payment.enums';
/** Client-side filter contract; replace with query params + server filters later. */
export interface PaymentsUiFilters {
  /** ISO date string (yyyy-MM-dd) or null = no bound */
  dateFrom: string | null;
  dateTo: string | null;
  method: 'ALL' | PaymentMethod;
  status: 'ALL' | PaymentStatus;
  transactionQuery: string;
}

export const defaultPaymentsUiFilters = (): PaymentsUiFilters => ({
  dateFrom: null,
  dateTo: null,
  method: 'ALL',
  status: 'ALL',
  transactionQuery: '',
});
