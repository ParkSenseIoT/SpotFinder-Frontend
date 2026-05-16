import { Component } from '@angular/core';
import { PlaceholderPage } from '../../../shared/components/placeholder/placeholder.page';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [PlaceholderPage],
  template: `
    <app-placeholder-page
      title="Settings"
      subtitle="Manage your profile, password, registered vehicles and notification preferences."
      [bullets]="bullets" />
  `
})
export class SettingsPage {
  bullets = [
    'Edit profile (PUT /users/{id}) — US22',
    'Change password (POST /users/{id}/change-password) — TS35',
    'Manage vehicles (POST/GET/DELETE /users/{id}/vehicles) — US23, TS36-38',
    'Notification preferences (PUT /users/{id}/notification-preferences) — US24, TS40'
  ];
}
