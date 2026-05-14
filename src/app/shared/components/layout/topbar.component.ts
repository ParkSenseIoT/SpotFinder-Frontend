import { Component, inject } from '@angular/core';
import { AuthStore } from '../../../iam/application/store/auth.store';

@Component({
  selector: 'app-topbar',
  standalone: true,
  template: `
    <header class="topbar">
      <div class="search-container">
        <span class="search-icon">⚲</span>
        <input type="text" class="search-input" placeholder="Search operational data..." />
      </div>

      <div class="topbar-actions">
        <button class="icon-btn">
          <span class="icon">🔔</span>
        </button>
        <button class="icon-btn">
          <span class="icon">❓</span>
        </button>

        <div class="user-profile" (click)="logout()">
          <div class="user-info">
            <span class="user-name">Admin System</span>
            <span class="user-role">LEVEL 4 CLEARANCE</span>
          </div>
          <div class="user-avatar">AS</div>
        </div>
      </div>
    </header>
  `,
  styleUrls: ['./topbar.component.scss']
})
export class TopbarComponent {
  private readonly authStore = inject(AuthStore);

  logout() {
    this.authStore.logout();
  }
}
