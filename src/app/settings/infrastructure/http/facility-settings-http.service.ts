import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { DEFAULT_FACILITY_SETTINGS, FacilitySettings } from '../../domain/models/facility-settings.models';

/**
 * Facility settings API seam — `/api/v1/parking-facilities/{id}` in production.
 * Returns + updates an in-memory snapshot so admins can validate the form.
 */
@Injectable({ providedIn: 'root' })
export class FacilitySettingsHttpService {
  private current: FacilitySettings = { ...DEFAULT_FACILITY_SETTINGS };

  get(): Observable<FacilitySettings> {
    return of({ ...this.current }).pipe(delay(380));
  }

  update(patch: Partial<FacilitySettings>): Observable<FacilitySettings> {
    this.current = { ...this.current, ...patch };
    return of({ ...this.current }).pipe(delay(420));
  }
}
