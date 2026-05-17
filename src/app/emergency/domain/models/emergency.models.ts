export type EmergencyStatus = 'ACTIVE' | 'RESOLVED' | 'EVACUATING';
export type EmergencyType = 'GAS_LEAK' | 'FIRE' | 'SMOKE' | 'OTHER';
export type OverallStatus = 'NORMAL' | 'EMERGENCY';

export interface EmergencyAlert {
  id: number;
  sensorId: string;
  gasLevel: number;
  type: EmergencyType;
  status: EmergencyStatus;
  triggeredAt: string | null;
  resolvedAt: string | null;
  resolvedBy: number | null;
  sensorLocation: string;
}

export interface EmergencyStatusInfo {
  isEmergencyActive: boolean;
  emergencyId: number | null;
  type: EmergencyType | null;
  gasLevel: number;
  sensorLocation: string | null;
  triggeredAt: string | null;
  overallStatus: OverallStatus;
}

export interface EmergencyAlertResource {
  id: number;
  sensorId: string | null;
  gasLevel: number;
  type: string | null;
  status: string | null;
  triggeredAt: string | null;
  resolvedAt: string | null;
  resolvedBy: number | null;
  sensorLocation: string | null;
}

export interface EmergencyStatusResource {
  isEmergencyActive: boolean;
  emergencyId: number | null;
  type: string | null;
  gasLevel: number;
  sensorLocation: string | null;
  triggeredAt: string | null;
  overallStatus: string | null;
}
