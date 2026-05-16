import { Component } from '@angular/core';
import { PlaceholderPage } from '../../../shared/components/placeholder/placeholder.page';

@Component({
  selector: 'app-user-management-page',
  standalone: true,
  imports: [PlaceholderPage],
  template: `
    <app-placeholder-page
      title="User Management"
      subtitle="Admin view of registered users (drivers and admins). Uses GET /api/v1/users."
      [bullets]="bullets" />
  `
})
export class UserManagementPage {
  bullets = [
    'List all users with role filter',
    'View user profile and registered vehicles',
    'Activate / deactivate accounts'
  ];
}
