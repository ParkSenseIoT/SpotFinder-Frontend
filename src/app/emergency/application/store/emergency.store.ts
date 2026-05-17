import { inject } from '@angular/core';
import {
  signalStore,
  withState,
  withMethods,
  patchState,
  withHooks,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { interval, pipe, switchMap, tap, filter } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { EmergencyHttpService } from '../../infrastructure/http/emergency-http.service';
import {
  EmergencyAlert,
  EmergencyStatusInfo,
} from '../../domain/models/emergency.models';
import { TokenStorageService } from '../../../iam/infrastructure/storage/token-storage.service';

interface EmergencyState {
  status: EmergencyStatusInfo | null;
  history: EmergencyAlert[];
  isLoadingStatus: boolean;
  isLoadingHistory: boolean;
  isResolving: boolean;
  isEvacuating: boolean;
  error: string | null;
  pollingActive: boolean;
}

const initialState: EmergencyState = {
  status: null,
  history: [],
  isLoadingStatus: false,
  isLoadingHistory: false,
  isResolving: false,
  isEvacuating: false,
  error: null,
  pollingActive: false,
};

const STATUS_POLL_MS = 5_000;

export const EmergencyStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(
    (
      store,
      service = inject(EmergencyHttpService),
      tokenStorage = inject(TokenStorageService)
    ) => ({
      loadStatus: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoadingStatus: true, error: null })),
          switchMap(() =>
            service.getStatus().pipe(
              tapResponse({
                next: (status) =>
                  patchState(store, { status, isLoadingStatus: false }),
                error: (err: unknown) => {
                  const message =
                    err instanceof Error ? err.message : 'Could not read status';
                  patchState(store, {
                    isLoadingStatus: false,
                    error: message,
                  });
                },
              })
            )
          )
        )
      ),

      loadHistory: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoadingHistory: true })),
          switchMap(() =>
            service.getHistory().pipe(
              tapResponse({
                next: (history) =>
                  patchState(store, { history, isLoadingHistory: false }),
                error: () => patchState(store, { isLoadingHistory: false }),
              })
            )
          )
        )
      ),

      resolveEmergency: rxMethod<number>(
        pipe(
          tap(() => patchState(store, { isResolving: true, error: null })),
          switchMap((emergencyId) => {
            const user = tokenStorage.getUser();
            const adminId = Number(user?.id) || 0;
            return service.resolve(emergencyId, adminId).pipe(
              tapResponse({
                next: () => {
                  patchState(store, (state) => ({
                    isResolving: false,
                    history: state.history.map((a) =>
                      a.id === emergencyId
                        ? {
                            ...a,
                            status: 'RESOLVED' as const,
                            resolvedAt: new Date().toISOString(),
                            resolvedBy: adminId,
                          }
                        : a
                    ),
                  }));
                },
                error: () =>
                  patchState(store, {
                    isResolving: false,
                    error: 'Could not resolve emergency.',
                  }),
              })
            );
          })
        )
      ),

      activateEvacuation: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isEvacuating: true, error: null })),
          switchMap(() =>
            service.evacuate().pipe(
              tapResponse({
                next: () => {
                  patchState(store, { isEvacuating: false });
                },
                error: () =>
                  patchState(store, {
                    isEvacuating: false,
                    error: 'Evacuation activation failed.',
                  }),
              })
            )
          )
        )
      ),

      startPolling: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { pollingActive: true })),
          switchMap(() =>
            interval(STATUS_POLL_MS).pipe(
              filter(() => store.pollingActive()),
              switchMap(() =>
                service.getStatus().pipe(
                  tapResponse({
                    next: (status) => patchState(store, { status }),
                    error: () => undefined,
                  })
                )
              )
            )
          )
        )
      ),

      stopPolling() {
        patchState(store, { pollingActive: false });
      },

      clearError() {
        patchState(store, { error: null });
      },
    })
  ),
  withHooks({
    onInit(store) {
      store.loadStatus();
      store.loadHistory();
      store.startPolling();
    },
    onDestroy(store) {
      store.stopPolling();
    },
  })
);
