import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState, withHooks } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap } from 'rxjs';
import { FacilitySettings } from '../../domain/models/facility-settings.models';
import { FacilitySettingsHttpService } from '../../infrastructure/http/facility-settings-http.service';

interface State {
  settings: FacilitySettings | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  lastSavedAt: string | null;
}

const initialState: State = {
  settings: null,
  isLoading: false,
  isSaving: false,
  error: null,
  lastSavedAt: null,
};

export const FacilitySettingsStore = signalStore(
  withState(initialState),
  withMethods((store, http = inject(FacilitySettingsHttpService)) => ({
    refresh: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(() =>
          http.get().pipe(
            tapResponse({
              next: (settings) => patchState(store, { settings, isLoading: false }),
              error: () => patchState(store, { isLoading: false, error: 'No se pudo cargar la configuración.' }),
            })
          )
        )
      )
    ),

    save: rxMethod<Partial<FacilitySettings>>(
      pipe(
        tap(() => patchState(store, { isSaving: true, error: null })),
        switchMap((patch) =>
          http.update(patch).pipe(
            tapResponse({
              next: (settings) =>
                patchState(store, { settings, isSaving: false, lastSavedAt: new Date().toISOString() }),
              error: () =>
                patchState(store, { isSaving: false, error: 'No se pudo guardar la configuración.' }),
            })
          )
        )
      )
    ),
  })),
  withHooks({
    onInit(store) {
      store.refresh();
    },
  })
);
