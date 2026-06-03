import { computed, inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState, withComputed, withHooks } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap } from 'rxjs';
import { AdminUser, CreateAdminRequest, UserRole } from '../../domain/models/users.models';
import { UsersHttpService } from '../../infrastructure/http/users-http.service';

interface UsersState {
  users: AdminUser[];
  filter: 'ALL' | UserRole;
  isLoading: boolean;
  error: string | null;
  lastSyncedAt: string | null;
}

const initialState: UsersState = {
  users: [],
  filter: 'ALL',
  isLoading: false,
  error: null,
  lastSyncedAt: null,
};

export const UsersStore = signalStore(
  withState(initialState),
  withComputed(({ users, filter }) => ({
    filteredUsers: computed(() => {
      const f = filter();
      const all = users();
      if (f === 'ALL') return all;
      return all.filter(u => u.roles.includes(f));
    }),
    activeCount: computed(() => users().filter(u => u.active).length),
    adminCount: computed(() => users().filter(u => u.roles.includes(UserRole.ADMIN)).length),
    driverCount: computed(() => users().filter(u => u.roles.includes(UserRole.CAR_OWNER)).length),
  })),
  withMethods((store, http = inject(UsersHttpService)) => ({
    setFilter(filter: 'ALL' | UserRole) {
      patchState(store, { filter });
    },

    refresh: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(() =>
          http.list().pipe(
            tapResponse({
              next: (users) =>
                patchState(store, { users, isLoading: false, lastSyncedAt: new Date().toISOString() }),
              error: () =>
                patchState(store, { isLoading: false, error: 'No se pudieron cargar los usuarios.' }),
            })
          )
        )
      )
    ),

    createAdmin: rxMethod<CreateAdminRequest>(
      pipe(
        switchMap((req) =>
          http.createAdmin(req).pipe(
            tap((created) => patchState(store, (s) => ({ users: [created, ...s.users] })))
          )
        )
      )
    ),

    toggleActive: rxMethod<string>(
      pipe(
        switchMap((id) =>
          http.toggleActive(id).pipe(
            tap((updated) =>
              patchState(store, {
                users: store.users().map((u) => (u.id === updated.id ? updated : u)),
              })
            )
          )
        )
      )
    ),
  })),
  withHooks({
    onInit(store) {
      store.refresh();
    },
  })
);
