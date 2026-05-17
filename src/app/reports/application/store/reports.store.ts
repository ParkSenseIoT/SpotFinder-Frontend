import { DOCUMENT } from '@angular/common';
import { inject } from '@angular/core';
import {
  signalStore,
  withState,
  withMethods,
  patchState,
  withHooks,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { ReportsHttpService } from '../../infrastructure/http/reports-http.service';
import {
  AnalyticsReport,
  GenerateReportPayload,
} from '../../domain/models/report.models';
import { TokenStorageService } from '../../../iam/infrastructure/storage/token-storage.service';

interface ReportsState {
  reports: AnalyticsReport[];
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;
}

const initialState: ReportsState = {
  reports: [],
  isLoading: false,
  isGenerating: false,
  error: null,
};

export const ReportsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(
    (
      store,
      service = inject(ReportsHttpService),
      tokenStorage = inject(TokenStorageService),
      doc = inject(DOCUMENT)
    ) => ({
      loadReports: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(() =>
            service.list().pipe(
              tapResponse({
                next: (reports) =>
                  patchState(store, { reports, isLoading: false }),
                error: (err: unknown) => {
                  const message =
                    err instanceof Error
                      ? err.message
                      : 'Could not load reports';
                  patchState(store, {
                    isLoading: false,
                    error: message,
                  });
                },
              })
            )
          )
        )
      ),

      generateReport: rxMethod<Omit<GenerateReportPayload, 'generatedBy'>>(
        pipe(
          tap(() => patchState(store, { isGenerating: true, error: null })),
          switchMap((payload) => {
            const user = tokenStorage.getUser();
            const generatedBy = Number(user?.id) || null;
            return service.generate({ ...payload, generatedBy }).pipe(
              switchMap(() => service.list()),
              tapResponse({
                next: (reports) =>
                  patchState(store, { reports, isGenerating: false }),
                error: () =>
                  patchState(store, {
                    isGenerating: false,
                    error: 'Could not queue report generation.',
                  }),
              })
            );
          })
        )
      ),

      downloadReport: rxMethod<AnalyticsReport>(
        pipe(
          switchMap((report) =>
            service.download(report.id).pipe(
              tapResponse({
                next: (blob) => {
                  const filename = `report-${report.reportType.toLowerCase()}-${report.id}.pdf`;
                  const url = URL.createObjectURL(blob);
                  const a = doc.createElement('a');
                  a.href = url;
                  a.download = filename;
                  a.click();
                  URL.revokeObjectURL(url);
                },
                error: () =>
                  patchState(store, {
                    error: 'Download failed. The report may still be generating.',
                  }),
              })
            )
          )
        )
      ),

      clearError() {
        patchState(store, { error: null });
      },
    })
  ),
  withHooks({
    onInit(store) {
      store.loadReports();
    },
  })
);
