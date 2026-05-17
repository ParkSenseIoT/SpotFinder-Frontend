export type SessionStatus = 'ACTIVE' | 'ENDED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'NOT_REQUIRED';

export interface VehicleSession {
  id: number;
  licensePlate: string;
  entryTimestamp: string | null;
  exitTimestamp: string | null;
  slotId: number | null;
  paymentStatus: PaymentStatus;
  sessionStatus: SessionStatus;
  currentDuration: string;
  userId: number | null;
}

export interface PlateRecognitionResult {
  licensePlate: string;
  confidence: number;
  isHighConfidence: boolean;
}

export interface EntryRequest {
  imageData: string;
  barrierCode: string;
}

export interface ExitRequest {
  imageData: string;
  barrierCode: string;
}

export interface VehicleSessionResource {
  id: number;
  licensePlate: string;
  entryTimestamp: string | null;
  exitTimestamp: string | null;
  slotId: number | null;
  paymentStatus: string | null;
  sessionStatus: string | null;
  currentDuration: string | null;
  userId: number | null;
}
