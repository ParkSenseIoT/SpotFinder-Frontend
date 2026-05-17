export type ParkingSlotStatus = 'AVAILABLE' | 'OCCUPIED' | 'OUT_OF_SERVICE';

export interface LiveParkingSlot {
  id: number;
  code: string;
  status: ParkingSlotStatus;
  floor: number;
  sensorId?: string;
  facilityId?: number;
  lastUpdated?: string;
  currentPlate?: string;
  entryTime?: string;
}

export interface SectorGroup {
  id: string;
  name: string;
  slots: LiveParkingSlot[];
  occupiedCount: number;
  totalCount: number;
}

export interface OccupancySummary {
  total: number;
  available: number;
  occupied: number;
  occupancyRate: number;
}

export interface ParkingSlotResource {
  id: number;
  slotCode: string;
  status: string;
  sensorId: string | null;
  facilityId: number | null;
  lastUpdated: string | null;
}
