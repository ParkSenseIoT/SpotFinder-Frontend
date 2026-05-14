import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TokenStorageService } from '../../../iam/infrastructure/storage/token-storage.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterModule], // RouterModule es vital para routerLink y router-outlet
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.scss']
})
export class DashboardLayoutComponent {
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly router = inject(Router);

  // Puedes extraer datos del tokenStorage si quieres mostrar el nombre real del usuario
  userName = 'Admin_User_01';
  userRole = 'Global Ops';

  logout() {
    this.tokenStorage.clearSession();
    this.router.navigate(['/auth/login']);
  }
}
