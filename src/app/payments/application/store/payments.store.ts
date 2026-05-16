import { DOCUMENT } from '@angular/common';
import { computed, inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState, withComputed, withHooks } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, filter, forkJoin, interval, pipe, startWith, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { PaymentsHttpService } from '../../infrastructure/http/payments-http.service';
import { GenerateReportRequest, Payment, PaymentReport, RevenueAnalytics } from '../../domain/models/payment.models';
import { PaymentReportFormat } from '../../domain/enums/payment.enums';
import { PaymentsUiFilters, defaultPaymentsUiFilters } from '../../domain/models/payment-filters.model';
import { applyPaymentFilters } from '../../domain/utils/payment-filter.utils';

interface PaymentsState {
  revenue: RevenueAnalytics | null;
  payments: Payment[];
  reports: PaymentReport[];
  filters: PaymentsUiFilters;
  revenueLoading: boolean;
  paymentsLoading: boolean;
  reportsLoading: boolean;
  revenueError: string | null;
  paymentsError: string | null;
  reportsError: string | null;
  autoRefreshActive: boolean;
  lastSyncedAt: string | null;
  /** Reserved for server pagination */
  nextCursor: string | null;
  pageSize: number;
}

const initialState: PaymentsState = {
  revenue: null,
  payments: [],
  reports: [],
  filters: defaultPaymentsUiFilters(),
  revenueLoading: false,
  paymentsLoading: false,
  reportsLoading: false,
  revenueError: null,
  paymentsError: null,
  reportsError: null,
  autoRefreshActive: false,
  lastSyncedAt: null,
  nextCursor: null,
  pageSize: 50,
};

export const PaymentsStore = signalStore(
  withState(initialState),
  withComputed(({ payments, filters }) => ({
    filteredPayments: computed(() => applyPaymentFilters(payments(), filters())),
  })),
  withMethods((store, http = inject(PaymentsHttpService), doc = inject(DOCUMENT)) => ({
    setFilters(patch: Partial<PaymentsUiFilters>) {
      patchState(store, { filters: { ...store.filters(), ...patch } });
    },

    resetFilters() {
      patchState(store, { filters: defaultPaymentsUiFilters() });
    },

    loadRevenue: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { revenueLoading: true, revenueError: null })),
        switchMap(() =>
          http.getRevenueAnalytics().pipe(
            tapResponse({
              next: (revenue) =>
                patchState(store, {
                  revenue,
                  revenueLoading: false,
                  lastSyncedAt: new Date().toISOString(),
                }),
              error: () =>
                patchState(store, {
                  revenueLoading: false,
                  revenueError: 'Unable to load revenue analytics.',
                }),
            })
          )
        )
      )
    ),

    loadPayments: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { paymentsLoading: true, paymentsError: null })),
        switchMap(() =>
          http.listPayments().pipe(
            tapResponse({
              next: (payments) =>
                patchState(store, {
                  payments,
                  paymentsLoading: false,
                  lastSyncedAt: new Date().toISOString(),
                }),
              error: () =>
                patchState(store, {
                  paymentsLoading: false,
                  paymentsError: 'Unable to load payment history.',
                }),
            })
          )
        )
      )
    ),

    loadReports: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { reportsLoading: true, reportsError: null })),
        switchMap(() =>
          http.listReports().pipe(
            tapResponse({
              next: (reports) =>
                patchState(store, {
                  reports,
                  reportsLoading: false,
                  lastSyncedAt: new Date().toISOString(),
                }),
              error: () =>
                patchState(store, {
                  reportsLoading: false,
                  reportsError: 'Unable to load reports.',
                }),
            })
          )
        )
      )
    ),

    refreshAll: rxMethod<void>(
      pipe(
        tap(() =>
          patchState(store, {
            revenueLoading: true,
            paymentsLoading: true,
            reportsLoading: true,
            revenueError: null,
            paymentsError: null,
            reportsError: null,
          })
        ),
        switchMap(() =>
          forkJoin({
            revenue: http.getRevenueAnalytics(),
            payments: http.listPayments(),
            reports: http.listReports(),
          }).pipe(
            tapResponse({
              next: ({ revenue, payments, reports }) =>
                patchState(store, {
                  revenue,
                  payments,
                  reports,
                  revenueLoading: false,
                  paymentsLoading: false,
                  reportsLoading: false,
                  lastSyncedAt: new Date().toISOString(),
                }),
              error: () =>
                patchState(store, {
                  revenueLoading: false,
                  paymentsLoading: false,
                  reportsLoading: false,
                  revenueError: 'Refresh failed for revenue.',
                  paymentsError: 'Refresh failed for payments.',
                  reportsError: 'Refresh failed for reports.',
                }),
            })
          )
        )
      )
    ),

    generateReport: rxMethod<GenerateReportRequest>(
      pipe(
        tap(() => patchState(store, { reportsLoading: true, reportsError: null })),
        switchMap((req) =>
          http.generateReport(req).pipe(
            tap((created) => {
              patchState(store, (s) => ({
                reports: [created, ...s.reports],
                reportsLoading: false,
              }));
            }),
            switchMap(() =>
              http.listReports().pipe(
                tap((reports) => patchState(store, { reports }))
              )
            ),
            catchError(() => {
              patchState(store, {
                reportsLoading: false,
                reportsError: 'Could not queue report generation.',
              });
              return EMPTY;
            })
          )
        )
      )
    ),

    downloadReport: rxMethod<string>(
      pipe(
        switchMap((id) =>
          http.downloadReport(id).pipe(
            tapResponse({
              next: (blob) => {
                const report = store.reports().find((r) => r.id === id);
                const name = report?.name?.replace(/\s+/g, '_') ?? id;
                const ext = report?.format === PaymentReportFormat.CSV ? 'csv' : 'pdf';
                const url = URL.createObjectURL(blob);
                const a = doc.createElement('a');
                a.href = url;
                a.download = `${name}.${ext}`;
                a.click();
                URL.revokeObjectURL(url);
              },
              error: () =>
                patchState(store, {
                  reportsError: 'Download failed. Report may still be generating.',
                }),
            })
          )
        )
      )
    ),

    startAutoRefresh: rxMethod<void>(
      pipe(
        filter(() => !store.autoRefreshActive()),
        tap(() => patchState(store, { autoRefreshActive: true })),
        switchMap(() =>
          interval(22000).pipe(
            startWith(0),
            filter(() => store.autoRefreshActive()),
            switchMap(() =>
              forkJoin({
                revenue: http.getRevenueAnalytics(),
                payments: http.listPayments(),
              }).pipe(
                tapResponse({
                  next: ({ revenue, payments }) =>
                    patchState(store, {
                      revenue,
                      payments,
                      lastSyncedAt: new Date().toISOString(),
                    }),
                  error: () =>
                    patchState(store, {
                      revenueError: 'Auto-refresh: revenue failed.',
                      paymentsError: 'Auto-refresh: payments failed.',
                    }),
                })
              )
            )
          )
        )
      )
    ),

    stopAutoRefresh() {
      patchState(store, { autoRefreshActive: false });
    },
  })),
  withHooks({
    onInit(store) {
      store.refreshAll();
    },
    onDestroy(store) {
      store.stopAutoRefresh();
    },
  })
);
