import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TokenStorageService } from '../../../iam/infrastructure/storage/token-storage.service';
import { NotificationsStore } from '../../../notifications/application/store/notifications.store';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterModule], // RouterModule es vital para routerLink y router-outlet
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.scss']
})
export class DashboardLayoutComponent implements OnInit {
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly router = inject(Router);
  readonly notificationsStore = inject(NotificationsStore);

  // Puedes extraer datos del tokenStorage si quieres mostrar el nombre real del usuario
  userName = 'Admin_User_01';
  userRole = 'Global Ops';

  ngOnInit() {
    // We only need to start the store if it's not already running. 
    // The store's withHooks onInit will start it.
  }

  logout() {
    this.tokenStorage.clearSession();
    this.router.navigate(['/auth/login']);
  }
}
