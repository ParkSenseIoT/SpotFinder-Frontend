import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReportsStore } from '../../application/store/reports.store';
import {
  AnalyticsReport,
  ReportType,
} from '../../domain/models/report.models';

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [CommonModule, DatePipe, ReactiveFormsModule],
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
})
export class ReportsPage {
  readonly store = inject(ReportsStore);
  private readonly fb = inject(FormBuilder);

  readonly reportTypes: ReportType[] = ['OCCUPANCY', 'REVENUE', 'PEAK_HOURS', 'HEATMAP'];

  readonly form = this.fb.nonNullable.group({
    reportType: ['OCCUPANCY' as ReportType, [Validators.required]],
    startDate: [this.defaultStartDate(), [Validators.required]],
    endDate: [this.todayIso(), [Validators.required]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.store.generateReport({
      reportType: value.reportType,
      startDate: value.startDate,
      endDate: value.endDate,
      facilityId: null,
    });
  }

  download(report: AnalyticsReport): void {
    this.store.downloadReport(report);
  }

  refresh(): void {
    this.store.loadReports();
  }

  private todayIso(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private defaultStartDate(): string {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().slice(0, 10);
  }
}
