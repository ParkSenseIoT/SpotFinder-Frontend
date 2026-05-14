import { applyPaymentFilters } from './payment-filter.utils';
import { Payment } from '../models/payment.models';
import { defaultPaymentsUiFilters, PaymentsUiFilters } from '../models/payment-filters.model';
import { PaymentMethod, PaymentStatus } from '../enums/payment.enums';

describe('applyPaymentFilters', () => {
  const payment = (
    id: string,
    overrides: Partial<Payment> = {}
  ): Payment => ({
    id,
    sessionId: `sess-${id}`,
    amount: 10,
    currency: 'PEN',
    paymentMethod: PaymentMethod.YAPE,
    status: PaymentStatus.COMPLETED,
    transactionId: `TX-${id}`,
    receiptUrl: null,
    paidAt: '2026-05-10T12:00:00.000Z',
    duration: '01:00',
    hoursCharged: 1,
    userId: 'u-1',
    ...overrides,
  });

  const yapeCompleted = payment('001');
  const cardPending = payment('002', {
    paymentMethod: PaymentMethod.CREDIT_CARD,
    status: PaymentStatus.PENDING,
    transactionId: 'TX-CC-002',
    paidAt: '2026-05-12T09:30:00.000Z',
  });
  const cardFailed = payment('003', {
    paymentMethod: PaymentMethod.DEBIT_CARD,
    status: PaymentStatus.FAILED,
    transactionId: 'TX-DC-003',
    paidAt: '2026-05-08T18:00:00.000Z',
  });

  const all = [yapeCompleted, cardPending, cardFailed];

  it('returns every payment when the default UI filters are applied', () => {
    expect(applyPaymentFilters(all, defaultPaymentsUiFilters())).toEqual([
      cardPending,
      yapeCompleted,
      cardFailed,
    ]);
  });

  it('filters by payment method', () => {
    const filters: PaymentsUiFilters = { ...defaultPaymentsUiFilters(), method: PaymentMethod.CREDIT_CARD };
    expect(applyPaymentFilters(all, filters)).toEqual([cardPending]);
  });

  it('filters by payment status', () => {
    const filters: PaymentsUiFilters = { ...defaultPaymentsUiFilters(), status: PaymentStatus.FAILED };
    expect(applyPaymentFilters(all, filters)).toEqual([cardFailed]);
  });

  it('matches the transactionQuery (case insensitive) against transactionId', () => {
    const filters: PaymentsUiFilters = { ...defaultPaymentsUiFilters(), transactionQuery: 'tx-cc' };
    expect(applyPaymentFilters(all, filters)).toEqual([cardPending]);
  });

  it('keeps only the payments whose paidAt falls inside the dateFrom/dateTo window', () => {
    const filters: PaymentsUiFilters = {
      ...defaultPaymentsUiFilters(),
      dateFrom: '2026-05-09',
      dateTo: '2026-05-11',
    };
    expect(applyPaymentFilters(all, filters)).toEqual([yapeCompleted]);
  });

  it('sorts results by paidAt descending (latest first)', () => {
    const sorted = applyPaymentFilters(all, defaultPaymentsUiFilters());
    expect(sorted.map((p) => p.id)).toEqual(['002', '001', '003']);
  });
});
