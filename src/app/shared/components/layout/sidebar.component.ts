import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar">
      <div class="sidebar-header">
        <h1 class="logo">SPOT<span>FINDER</span></h1>
        <span class="badge">ENTERPRISE IOT</span>
      </div>

      <nav class="sidebar-nav">
        @for (item of menuItems; track item.path) {
          <a [routerLink]="item.path" routerLinkActive="active" class="nav-item">
            <span class="icon">{{ item.icon }}</span>
            <span class="label">{{ item.label }}</span>
          </a>
        }
      </nav>
    </aside>
  `,
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  // Configuración del menú basado en tu diseño
  menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '◫' },
    { path: '/parking', label: 'Parking Monitoring', icon: 'P' },
    { path: '/analytics', label: 'Analytics', icon: '📊' },
    { path: '/access', label: 'Access Control', icon: '🛡️' },
    { path: '/emergency', label: 'Emergency Center', icon: '🚨' },
    { path: '/notifications', label: 'Notifications', icon: '🔔' }
  ];
}
