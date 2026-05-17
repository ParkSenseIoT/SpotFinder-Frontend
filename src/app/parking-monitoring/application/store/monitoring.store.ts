import { computed, inject } from '@angular/core';
import {
  signalStore,
  withState,
  withMethods,
  patchState,
  withComputed,
  withHooks,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { interval, pipe, switchMap, tap, filter } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { MonitoringHttpService } from '../../infrastructure/http/monitoring-http.service';
import {
  LiveParkingSlot,
  OccupancySummary,
  ParkingSlotStatus,
  SectorGroup,
} from '../../domain/models/monitoring.models';

interface MonitoringState {
  rawSlots: LiveParkingSlot[];
  occupancy: OccupancySummary | null;
  selectedSector: SectorGroup | null;
  isLoading: boolean;
  error: string | null;
  pollingActive: boolean;
}

const initialState: MonitoringState = {
  rawSlots: [],
  occupancy: null,
  selectedSector: null,
  isLoading: false,
  error: null,
  pollingActive: false,
};

const POLL_INTERVAL_MS = 10_000;

const chunkArray = (arr: LiveParkingSlot[], size: number) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );

export const MonitoringStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ rawSlots, occupancy }) => ({
    sectorGroups: computed(() => {
      const chunks = chunkArray(rawSlots(), 6);
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      return chunks.map(
        (chunk, index): SectorGroup => ({
          id: `sec-${index}`,
          name: `SECTOR ${letters[index % 26]}`,
          slots: chunk,
          occupiedCount: chunk.filter((s) => s.status === 'OCCUPIED').length,
          totalCount: chunk.length,
        })
      );
    }),
    occupancyRatePercent: computed(() => {
      const summary = occupancy();
      if (!summary) return 0;
      return Math.round(summary.occupancyRate * 100) / 100;
    }),
  })),
  withMethods((store, service = inject(MonitoringHttpService)) => ({
    loadAllSlots: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(() =>
          service.getAllLiveSlots().pipe(
            tapResponse({
              next: (slots) =>
                patchState(store, { rawSlots: slots, isLoading: false }),
              error: (err: unknown) => {
                const message =
                  err instanceof Error ? err.message : 'Failed to load slots';
                patchState(store, { isLoading: false, error: message });
              },
            })
          )
        )
      )
    ),

    loadOccupancySummary: rxMethod<void>(
      pipe(
        switchMap(() =>
          service.getOccupancySummary().pipe(
            tapResponse({
              next: (occupancy) => patchState(store, { occupancy }),
              error: () => undefined,
            })
          )
        )
      )
    ),

    updateSlotStatus: rxMethod<{ slotId: number; status: ParkingSlotStatus }>(
      pipe(
        switchMap(({ slotId, status }) =>
          service.updateStatus(slotId, status).pipe(
            tapResponse({
              next: () => {
                patchState(store, (state) => ({
                  rawSlots: state.rawSlots.map((slot) =>
                    slot.id === slotId ? { ...slot, status } : slot
                  ),
                  selectedSector: state.selectedSector
                    ? {
                        ...state.selectedSector,
                        slots: state.selectedSector.slots.map((slot) =>
                          slot.id === slotId ? { ...slot, status } : slot
                        ),
                      }
                    : null,
                }));
              },
              error: () => undefined,
            })
          )
        )
      )
    ),

    selectSector(sector: SectorGroup) {
      patchState(store, { selectedSector: sector });
    },

    clearSelection() {
      patchState(store, { selectedSector: null });
    },

    startPolling: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { pollingActive: true })),
        switchMap(() =>
          interval(POLL_INTERVAL_MS).pipe(
            filter(() => store.pollingActive()),
            switchMap(() =>
              service.getAllLiveSlots().pipe(
                tapResponse({
                  next: (slots) => patchState(store, { rawSlots: slots }),
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
  })),
  withHooks({
    onInit(store) {
      store.loadAllSlots();
      store.loadOccupancySummary();
      store.startPolling();
    },
    onDestroy(store) {
      store.stopPolling();
    },
  })
);
