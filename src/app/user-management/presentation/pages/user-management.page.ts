import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserManagementStore } from '../../application/store/user-management.store';
import { RoleFilter } from '../../domain/models/admin-user.models';

@Component({
  selector: 'app-user-management-page',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule],
  templateUrl: './user-management.page.html',
  styleUrls: ['./user-management.page.scss'],
})
export class UserManagementPage {
  readonly store = inject(UserManagementStore);

  readonly roleOptions: { label: string; value: RoleFilter }[] = [
    { label: 'All', value: 'ALL' },
    { label: 'Admin', value: 'ADMIN' },
    { label: 'Driver', value: 'DRIVER' },
  ];

  onSearch(value: string): void {
    this.store.setSearch(value);
  }

  setRole(role: RoleFilter): void {
    this.store.setRoleFilter(role);
  }

  refresh(): void {
    this.store.loadUsers();
  }

  roleBadge(roles: string[]): string {
    if (roles.some((r) => r.toUpperCase().includes('ADMIN'))) return 'ADMIN';
    if (roles.some((r) => r.toUpperCase().includes('DRIVER'))) return 'DRIVER';
    return roles[0] ?? '—';
  }
}
