import { Component } from '@angular/core';
import { PlaceholderPage } from '../../../shared/components/placeholder/placeholder.page';

@Component({
  selector: 'app-access-control-page',
  standalone: true,
  imports: [PlaceholderPage],
  template: `
    <app-placeholder-page
      title="Access Control"
      subtitle="Live vehicle sessions, ALPR feed and entry/exit history. Pending wiring against /api/v1/access/* and /api/v1/parking-sessions/*."
      [bullets]="bullets" />
  `
})
export class AccessControlPage {
  bullets = [
    'Active sessions list (GET /parking-sessions/active)',
    'Session history (GET /parking-sessions/history)',
    'ALPR recognition feed (POST /access/alpr)',
    'Manual entry/exit registration (POST /access/entries, /access/exits)'
  ];
}
