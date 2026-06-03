/** Configuration of the parking facility managed by the admin dashboard. */
export interface FacilitySettings {
  facilityId: string;
  facilityName: string;
  address: string;
  totalSlots: number;
  ratePerHour: number;
  currency: string;
  gracePeriodMinutes: number;
  sensorThresholdCm: number;
  evacuationGasPpm: number;
  contactEmail: string;
  contactPhone: string;
  enableAlpr: boolean;
  enableLedGuidance: boolean;
  enableEmergencyProtocol: boolean;
}

export const DEFAULT_FACILITY_SETTINGS: FacilitySettings = {
  facilityId: 'mall-norte-b2',
  facilityName: 'Mall Norte · Centro Comercial',
  address: 'Av. Industrial 200, Independencia',
  totalSlots: 320,
  ratePerHour: 6,
  currency: 'PEN',
  gracePeriodMinutes: 15,
  sensorThresholdCm: 100,
  evacuationGasPpm: 900,
  contactEmail: 'ops@spotfinder.pe',
  contactPhone: '+51 999 000 111',
  enableAlpr: true,
  enableLedGuidance: true,
  enableEmergencyProtocol: true,
};
