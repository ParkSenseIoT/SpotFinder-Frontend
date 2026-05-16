import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TokenStorageService } from '../../../iam/infrastructure/storage/token-storage.service';
import { NotificationsStore } from '../../../notifications/application/store/notifications.store';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.scss']
})
export class DashboardLayoutComponent implements OnInit {
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly router = inject(Router);
  readonly notificationsStore = inject(NotificationsStore);

  private readonly user = this.tokenStorage.getUser();

  readonly userName = this.buildUserName();
  readonly userRole = this.buildUserRole();

  ngOnInit(): void {
    // NotificationsStore self-initializes through withHooks#onInit.
  }

  logout(): void {
    this.tokenStorage.clearSession();
    this.router.navigate(['/auth/login']);
  }

  private buildUserName(): string {
    if (!this.user) return 'Operator';
    const first = (this.user.firstName ?? '').trim();
    const last = (this.user.lastName ?? '').trim();
    const full = `${first} ${last}`.trim();
    return full || (this.user.email ?? 'Operator');
  }

  private buildUserRole(): string {
    const roles: string[] = this.user?.roles ?? [];
    if (roles.includes('ADMIN') || roles.includes('ROLE_ADMIN')) return 'Administrator';
    if (roles.includes('DRIVER') || roles.includes('ROLE_DRIVER')) return 'Driver';
    return roles[0] ?? 'Operator';
  }
}
