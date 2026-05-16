export interface Vehicle {
  id: number;
  userId: number;
  plate: string;
  brand: string;
  model: string;
  color: string;
  createdAt: string | null;
}

export interface VehicleResource {
  id: number;
  userId: number;
  plate: string;
  brand: string;
  model: string;
  color: string;
  createdAt: string | null;
}

export interface UpdateProfilePayload {
  firstName: string;
  lastName: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface RegisterVehiclePayload {
  plate: string;
  brand: string;
  model: string;
  color: string;
}
