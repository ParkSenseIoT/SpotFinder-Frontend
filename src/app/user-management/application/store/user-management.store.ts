import { computed, inject } from '@angular/core';
import {
  signalStore,
  withState,
  withMethods,
  patchState,
  withHooks,
  withComputed,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { UsersHttpService } from '../../infrastructure/http/users-http.service';
import {
  AdminUser,
  RoleFilter,
} from '../../domain/models/admin-user.models';

interface UserManagementState {
  users: AdminUser[];
  search: string;
  roleFilter: RoleFilter;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserManagementState = {
  users: [],
  search: '',
  roleFilter: 'ALL',
  isLoading: false,
  error: null,
};

export const UserManagementStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ users, search, roleFilter }) => ({
    filteredUsers: computed(() => {
      const term = search().trim().toLowerCase();
      const role = roleFilter();
      return users().filter((user) => {
        const matchesRole =
          role === 'ALL'
            ? true
            : user.roles.some((r) => r.toUpperCase().includes(role));
        if (!matchesRole) return false;
        if (!term) return true;
        const haystack = `${user.email} ${user.firstName} ${user.lastName}`.toLowerCase();
        return haystack.includes(term);
      });
    }),
    totalCount: computed(() => users().length),
    adminCount: computed(
      () => users().filter((u) => u.roles.some((r) => r.toUpperCase().includes('ADMIN'))).length
    ),
    driverCount: computed(
      () => users().filter((u) => u.roles.some((r) => r.toUpperCase().includes('DRIVER'))).length
    ),
  })),
  withMethods((store, service = inject(UsersHttpService)) => ({
    loadUsers: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(() =>
          service.listAll().pipe(
            tapResponse({
              next: (users) => patchState(store, { users, isLoading: false }),
              error: (err: unknown) => {
                const message =
                  err instanceof Error ? err.message : 'Could not load users';
                patchState(store, {
                  isLoading: false,
                  error: message,
                });
              },
            })
          )
        )
      )
    ),

    setSearch(search: string) {
      patchState(store, { search });
    },

    setRoleFilter(roleFilter: RoleFilter) {
      patchState(store, { roleFilter });
    },

    clearError() {
      patchState(store, { error: null });
    },
  })),
  withHooks({
    onInit(store) {
      store.loadUsers();
    },
  })
);
