import { computed, inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState, withComputed } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { MonitoringHttpService } from '../../infrastructure/http/monitoring-http.service';
import { LiveParkingSlot, SectorGroup } from '../../domain/models/monitoring.models';

interface MonitoringState {
  rawSlots: LiveParkingSlot[];
  selectedSector: SectorGroup | null; // Controla si vemos las tarjetas o el detalle
  isLoading: boolean;
}

const initialState: MonitoringState = {
  rawSlots: [],
  selectedSector: null,
  isLoading: false,
};

// Función auxiliar para dividir arreglos (Chunks)
const chunkArray = (arr: LiveParkingSlot[], size: number) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size)
  );

export const MonitoringStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ rawSlots }) => ({
    // 👇 Esta propiedad calculada agrupa automáticamente de 6 en 6
    sectorGroups: computed(() => {
      const chunks = chunkArray(rawSlots(), 6);
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

      return chunks.map((chunk, index) => {
        const floorNum = chunk[0]?.floor || 1;
        return {
          id: `sec-${index}`,
          name: `SECTOR ${letters[index % 26]}`,
          slots: chunk,
          occupiedCount: chunk.filter(s => s.status === 'OCCUPIED').length,
          totalCount: chunk.length
        } as SectorGroup;
      });
    })
  })),
  withMethods((store, service = inject(MonitoringHttpService)) => ({

    loadAllSlots: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() => service.getAllLiveSlots().pipe(
          tapResponse({
            next: (slots) => patchState(store, { rawSlots: slots, isLoading: false }),
            error: () => patchState(store, { isLoading: false })
          })
        ))
      )
    ),

    selectSector(sector: SectorGroup) {
      patchState(store, { selectedSector: sector });
    },

    clearSelection() {
      patchState(store, { selectedSector: null });
    }
  }))
);
