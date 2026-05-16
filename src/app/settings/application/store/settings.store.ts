import { inject } from '@angular/core';
import {
  signalStore,
  withState,
  withMethods,
  patchState,
  withHooks,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, of } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { SettingsHttpService } from '../../infrastructure/http/settings-http.service';
import {
  ChangePasswordPayload,
  RegisterVehiclePayload,
  UpdateProfilePayload,
  Vehicle,
} from '../../domain/models/settings.models';
import { TokenStorageService } from '../../../iam/infrastructure/storage/token-storage.service';
import { AdminUser } from '../../../user-management/domain/models/admin-user.models';

interface SettingsState {
  profile: AdminUser | null;
  vehicles: Vehicle[];
  userId: number | null;
  isLoadingProfile: boolean;
  isLoadingVehicles: boolean;
  isSavingProfile: boolean;
  isChangingPassword: boolean;
  isMutatingVehicle: boolean;
  profileMessage: string | null;
  passwordMessage: string | null;
  vehicleMessage: string | null;
  error: string | null;
}

const initialState: SettingsState = {
  profile: null,
  vehicles: [],
  userId: null,
  isLoadingProfile: false,
  isLoadingVehicles: false,
  isSavingProfile: false,
  isChangingPassword: false,
  isMutatingVehicle: false,
  profileMessage: null,
  passwordMessage: null,
  vehicleMessage: null,
  error: null,
};

export const SettingsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(
    (
      store,
      service = inject(SettingsHttpService),
      tokenStorage = inject(TokenStorageService)
    ) => ({
      resolveUserId() {
        const user = tokenStorage.getUser();
        const id = Number(user?.id);
        patchState(store, {
          userId: Number.isFinite(id) && id > 0 ? id : null,
        });
      },

      loadProfile: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoadingProfile: true, error: null })),
          switchMap(() => {
            const userId = store.userId();
            if (userId === null) {
              patchState(store, {
                isLoadingProfile: false,
                error: 'No authenticated user.',
              });
              return of(null);
            }
            return service.getProfile(userId).pipe(
              tapResponse({
                next: (profile) =>
                  patchState(store, { profile, isLoadingProfile: false }),
                error: () =>
                  patchState(store, {
                    isLoadingProfile: false,
                    error: 'Could not load profile.',
                  }),
              })
            );
          })
        )
      ),

      loadVehicles: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoadingVehicles: true })),
          switchMap(() => {
            const userId = store.userId();
            if (userId === null) {
              patchState(store, { isLoadingVehicles: false });
              return of([]);
            }
            return service.listVehicles(userId).pipe(
              tapResponse({
                next: (vehicles) =>
                  patchState(store, { vehicles, isLoadingVehicles: false }),
                error: () => patchState(store, { isLoadingVehicles: false }),
              })
            );
          })
        )
      ),

      updateProfile: rxMethod<UpdateProfilePayload>(
        pipe(
          tap(() =>
            patchState(store, {
              isSavingProfile: true,
              profileMessage: null,
              error: null,
            })
          ),
          switchMap((payload) => {
            const userId = store.userId();
            if (userId === null) {
              patchState(store, { isSavingProfile: false });
              return of(null);
            }
            return service.updateProfile(userId, payload).pipe(
              tapResponse({
                next: (profile) => {
                  patchState(store, {
                    profile,
                    isSavingProfile: false,
                    profileMessage: 'Profile updated successfully.',
                  });
                  const stored = tokenStorage.getUser();
                  if (stored) {
                    const updated = {
                      ...stored,
                      firstName: profile.firstName,
                      lastName: profile.lastName,
                    };
                    tokenStorage.saveSession(
                      tokenStorage.getToken() ?? '',
                      updated
                    );
                  }
                },
                error: () =>
                  patchState(store, {
                    isSavingProfile: false,
                    error: 'Could not update profile.',
                  }),
              })
            );
          })
        )
      ),

      changePassword: rxMethod<ChangePasswordPayload>(
        pipe(
          tap(() =>
            patchState(store, {
              isChangingPassword: true,
              passwordMessage: null,
              error: null,
            })
          ),
          switchMap((payload) => {
            const userId = store.userId();
            if (userId === null) {
              patchState(store, { isChangingPassword: false });
              return of(null);
            }
            return service.changePassword(userId, payload).pipe(
              tapResponse({
                next: () =>
                  patchState(store, {
                    isChangingPassword: false,
                    passwordMessage: 'Password updated successfully.',
                  }),
                error: () =>
                  patchState(store, {
                    isChangingPassword: false,
                    error: 'Current password is incorrect or request failed.',
                  }),
              })
            );
          })
        )
      ),

      registerVehicle: rxMethod<RegisterVehiclePayload>(
        pipe(
          tap(() =>
            patchState(store, {
              isMutatingVehicle: true,
              vehicleMessage: null,
              error: null,
            })
          ),
          switchMap((payload) => {
            const userId = store.userId();
            if (userId === null) {
              patchState(store, { isMutatingVehicle: false });
              return of(null);
            }
            return service.registerVehicle(userId, payload).pipe(
              tapResponse({
                next: (vehicle) =>
                  patchState(store, (state) => ({
                    vehicles: [...state.vehicles, vehicle],
                    isMutatingVehicle: false,
                    vehicleMessage: `Vehicle ${vehicle.plate} added.`,
                  })),
                error: () =>
                  patchState(store, {
                    isMutatingVehicle: false,
                    error: 'Could not register vehicle (plate may be in use).',
                  }),
              })
            );
          })
        )
      ),

      deleteVehicle: rxMethod<number>(
        pipe(
          tap(() => patchState(store, { isMutatingVehicle: true, error: null })),
          switchMap((vehicleId) => {
            const userId = store.userId();
            if (userId === null) {
              patchState(store, { isMutatingVehicle: false });
              return of(null);
            }
            return service.deleteVehicle(userId, vehicleId).pipe(
              tapResponse({
                next: () =>
                  patchState(store, (state) => ({
                    vehicles: state.vehicles.filter((v) => v.id !== vehicleId),
                    isMutatingVehicle: false,
                    vehicleMessage: 'Vehicle removed.',
                  })),
                error: () =>
                  patchState(store, {
                    isMutatingVehicle: false,
                    error: 'Could not delete vehicle (active session?).',
                  }),
              })
            );
          })
        )
      ),

      clearMessages() {
        patchState(store, {
          profileMessage: null,
          passwordMessage: null,
          vehicleMessage: null,
          error: null,
        });
      },
    })
  ),
  withHooks({
    onInit(store) {
      store.resolveUserId();
      store.loadProfile();
      store.loadVehicles();
    },
  })
);
