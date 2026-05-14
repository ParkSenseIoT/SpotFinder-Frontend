import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of } from 'rxjs';
import { MonitoringStore } from './monitoring.store';
import { MonitoringHttpService } from '../../infrastructure/http/monitoring-http.service';
import { LiveParkingSlot, SectorGroup } from '../../domain/models/monitoring.models';

describe('MonitoringStore', () => {
  let store: InstanceType<typeof MonitoringStore>;
  let httpSpy: jasmine.SpyObj<MonitoringHttpService>;

  // 8 slots → 2 sectores: SECTOR A (6 slots) y SECTOR B (2 slots)
  const fakeSlots: LiveParkingSlot[] = [
    { id: 1, code: 'A-01', status: 'AVAILABLE', floor: 1 },
    { id: 2, code: 'A-02', status: 'OCCUPIED', floor: 1, currentPlate: 'CA-8XF92' },
    { id: 3, code: 'A-03', status: 'OCCUPIED', floor: 1, currentPlate: 'NY-442KK' },
    { id: 4, code: 'A-04', status: 'AVAILABLE', floor: 1 },
    { id: 5, code: 'A-05', status: 'OUT_OF_SERVICE', floor: 1 },
    { id: 6, code: 'A-06', status: 'AVAILABLE', floor: 1 },
    { id: 7, code: 'B-01', status: 'OCCUPIED', floor: 1, currentPlate: 'TX-198LL' },
    { id: 8, code: 'B-02', status: 'AVAILABLE', floor: 1 },
  ];

  beforeEach(() => {
    httpSpy = jasmine.createSpyObj<MonitoringHttpService>('MonitoringHttpService', ['getAllLiveSlots']);
    httpSpy.getAllLiveSlots.and.returnValue(of(fakeSlots));

    TestBed.configureTestingModule({
      providers: [{ provide: MonitoringHttpService, useValue: httpSpy }],
    });
    store = TestBed.inject(MonitoringStore);
  });

  it('arranca con un fleet vacío y sin sector seleccionado', () => {
    expect(store.rawSlots()).toEqual([]);
    expect(store.sectorGroups()).toEqual([]);
    expect(store.selectedSector()).toBeNull();
  });

  it('agrupa los slots en sectores de 6 y calcula el occupiedCount por sector', fakeAsync(() => {
    store.loadAllSlots();
    tick();

    const sectors = store.sectorGroups();
    expect(sectors.length).toBe(2);

    expect(sectors[0].name).toBe('SECTOR A');
    expect(sectors[0].totalCount).toBe(6);
    expect(sectors[0].occupiedCount).toBe(2); // A-02 y A-03

    expect(sectors[1].name).toBe('SECTOR B');
    expect(sectors[1].totalCount).toBe(2);
    expect(sectors[1].occupiedCount).toBe(1); // B-01
  }));

  it('selectSector() y clearSelection() actualizan correctamente el sector elegido', () => {
    const sector: SectorGroup = {
      id: 'sec-0',
      name: 'SECTOR A',
      slots: fakeSlots.slice(0, 6),
      occupiedCount: 2,
      totalCount: 6,
    };

    store.selectSector(sector);
    expect(store.selectedSector()?.name).toBe('SECTOR A');

    store.clearSelection();
    expect(store.selectedSector()).toBeNull();
  });
});
