import { computed, inject } from '@angular/core';
import {
  signalStore,
  withState,
  withMethods,
  patchState,
  withHooks,
  withComputed,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, of, catchError } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { AccessControlHttpService } from '../../infrastructure/http/access-control-http.service';
import {
  PlateRecognitionResult,
  VehicleSession,
} from '../../domain/models/access-control.models';
import { TokenStorageService } from '../../../iam/infrastructure/storage/token-storage.service';

interface AccessControlState {
  activeSession: VehicleSession | null;
  sessionHistory: VehicleSession[];
  lastPlateResult: PlateRecognitionResult | null;
  userId: number | null;
  isLoadingActive: boolean;
  isLoadingHistory: boolean;
  isProcessingAlpr: boolean;
  isProcessingEntry: boolean;
  error: string | null;
}

const initialState: AccessControlState = {
  activeSession: null,
  sessionHistory: [],
  lastPlateResult: null,
  userId: null,
  isLoadingActive: false,
  isLoadingHistory: false,
  isProcessingAlpr: false,
  isProcessingEntry: false,
  error: null,
};

export const AccessControlStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ sessionHistory }) => ({
    activeSessionsFromHistory: computed(() =>
      sessionHistory().filter((s) => s.sessionStatus === 'ACTIVE')
    ),
    endedSessionsFromHistory: computed(() =>
      sessionHistory().filter((s) => s.sessionStatus !== 'ACTIVE')
    ),
  })),
  withMethods(
    (
      store,
      service = inject(AccessControlHttpService),
      tokenStorage = inject(TokenStorageService)
    ) => ({
      resolveUserId() {
        const user = tokenStorage.getUser();
        const id = Number(user?.id);
        patchState(store, {
          userId: Number.isFinite(id) && id > 0 ? id : null,
        });
      },

      loadActiveSession: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoadingActive: true, error: null })),
          switchMap(() => {
            const userId = store.userId();
            if (userId === null) {
              patchState(store, { isLoadingActive: false });
              return of(null);
            }
            return service.getActiveSession(userId).pipe(
              tapResponse({
                next: (session) =>
                  patchState(store, {
                    activeSession: session,
                    isLoadingActive: false,
                  }),
                error: () =>
                  patchState(store, {
                    activeSession: null,
                    isLoadingActive: false,
                  }),
              }),
              catchError(() => of(null))
            );
          })
        )
      ),

      loadHistory: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoadingHistory: true, error: null })),
          switchMap(() => {
            const userId = store.userId();
            if (userId === null) {
              patchState(store, { isLoadingHistory: false });
              return of([]);
            }
            return service.getSessionHistory(userId).pipe(
              tapResponse({
                next: (sessions) =>
                  patchState(store, {
                    sessionHistory: sessions,
                    isLoadingHistory: false,
                  }),
                error: (err: unknown) => {
                  const message =
                    err instanceof Error ? err.message : 'Could not load history';
                  patchState(store, {
                    isLoadingHistory: false,
                    error: message,
                  });
                },
              })
            );
          })
        )
      ),

      runAlpr: rxMethod<{ imageData: string; cameraPosition: string }>(
        pipe(
          tap(() => patchState(store, { isProcessingAlpr: true, error: null })),
          switchMap(({ imageData, cameraPosition }) =>
            service.recognizePlate(imageData, cameraPosition).pipe(
              tapResponse({
                next: (result) =>
                  patchState(store, {
                    lastPlateResult: result,
                    isProcessingAlpr: false,
                  }),
                error: () =>
                  patchState(store, {
                    isProcessingAlpr: false,
                    error: 'ALPR failed — verify backend and image payload.',
                  }),
              })
            )
          )
        )
      ),

      registerEntry: rxMethod<{ imageData: string; barrierCode: string }>(
        pipe(
          tap(() => patchState(store, { isProcessingEntry: true, error: null })),
          switchMap((req) =>
            service.registerEntry(req).pipe(
              tapResponse({
                next: () => {
                  patchState(store, { isProcessingEntry: false });
                },
                error: () =>
                  patchState(store, {
                    isProcessingEntry: false,
                    error: 'Entry registration failed.',
                  }),
              })
            )
          )
        )
      ),

      registerExit: rxMethod<{ imageData: string; barrierCode: string }>(
        pipe(
          tap(() => patchState(store, { isProcessingEntry: true, error: null })),
          switchMap((req) =>
            service.registerExit(req).pipe(
              tapResponse({
                next: () => {
                  patchState(store, { isProcessingEntry: false });
                },
                error: () =>
                  patchState(store, {
                    isProcessingEntry: false,
                    error: 'Exit registration failed (payment required?).',
                  }),
              })
            )
          )
        )
      ),

      endSession: rxMethod<number>(
        pipe(
          switchMap((sessionId) =>
            service.endSession(sessionId).pipe(
              tapResponse({
                next: () => {
                  patchState(store, (state) => ({
                    sessionHistory: state.sessionHistory.map((s) =>
                      s.id === sessionId
                        ? { ...s, sessionStatus: 'ENDED' as const }
                        : s
                    ),
                    activeSession:
                      state.activeSession?.id === sessionId
                        ? null
                        : state.activeSession,
                  }));
                },
                error: () =>
                  patchState(store, {
                    error: 'Could not end session (payment may be pending).',
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
      store.resolveUserId();
      store.loadActiveSession();
      store.loadHistory();
    },
  })
);
