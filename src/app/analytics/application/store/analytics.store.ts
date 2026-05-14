import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { AnalyticsData } from '../../domain/models/analytics.models';
import { AnalyticsMockService } from '../../infrastructure/http/analytics-mock.service';

interface AnalyticsState {
  data: AnalyticsData | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AnalyticsState = {
  data: null,
  isLoading: false,
  error: null,
};

export const AnalyticsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, mockService = inject(AnalyticsMockService)) => ({
    loadData: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() =>
          mockService.getAnalyticsData().pipe(
            tapResponse({
              next: (result) => patchState(store, { data: result, isLoading: false }),
              error: (err) => patchState(store, { error: 'Error loading analytics', isLoading: false })
            })
          )
        )
      )
    )
  }))
);
