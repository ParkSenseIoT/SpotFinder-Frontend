import { Component } from '@angular/core';
import { PlaceholderPage } from '../../../shared/components/placeholder/placeholder.page';

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [PlaceholderPage],
  template: `
    <app-placeholder-page
      title="Reports"
      subtitle="Generate occupancy and revenue reports (US13). Backend already exposes /api/v1/reports."
      [bullets]="bullets" />
  `
})
export class ReportsPage {
  bullets = [
    'Generate report for date range (POST /reports)',
    'List existing reports (GET /reports)',
    'Download generated PDF (GET /reports/{id}/download)'
  ];
}
