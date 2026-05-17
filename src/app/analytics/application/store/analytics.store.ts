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
import { forkJoin, pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { AnalyticsHttpService } from '../../infrastructure/http/analytics-http.service';
import { AnalyticsData, AnalyticsQueryParams } from '../../domain/models/analytics.models';
import { buildAnalyticsData } from '../mapper/analytics.mapper';

interface AnalyticsState {
  data: AnalyticsData | null;
  filters: AnalyticsQueryParams;
  isLoading: boolean;
  error: string | null;
}

const initialState: AnalyticsState = {
  data: null,
  filters: {},
  isLoading: false,
  error: null,
};

export const AnalyticsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ data }) => ({
    currency: computed(() => data()?.currency ?? 'PEN'),
  })),
  withMethods((store, service = inject(AnalyticsHttpService)) => ({
    setFilters(filters: AnalyticsQueryParams) {
      patchState(store, { filters });
    },

    loadData: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(() => {
          const params = store.filters();
          return forkJoin({
            occupancy: service.getOccupancy(params),
            revenue: service.getRevenue(params),
            heatmap: service.getHeatmap(params),
            peakHours: service.getPeakHours(params),
          }).pipe(
            tapResponse({
              next: ({ occupancy, revenue, heatmap, peakHours }) => {
                const data = buildAnalyticsData(occupancy, revenue, heatmap, peakHours);
                patchState(store, { data, isLoading: false });
              },
              error: (err: unknown) => {
                const message =
                  err instanceof Error ? err.message : 'Error loading analytics';
                patchState(store, { isLoading: false, error: message });
              },
            })
          );
        })
      )
    ),
  })),
  withHooks({
    onInit(store) {
      store.loadData();
    },
  })
);
