export interface LiveParkingSlot {
  id: number;
  code: string; // Ej: "A-01"
  status: 'AVAILABLE' | 'OCCUPIED' | 'OUT_OF_SERVICE';
  floor: number;
  currentPlate?: string; // Viene de la tabla Vehicle
  entryTime?: string;    // Viene de ParkingSession (ISO String)
}

export interface SectorGroup {
  id: string;
  name: string;
  slots: LiveParkingSlot[];
  occupiedCount: number;
  totalCount: number;
}
