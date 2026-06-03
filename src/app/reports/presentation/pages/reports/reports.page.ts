import { Component, inject, signal } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportsStore } from '../../../application/store/reports.store';
import { GenerateReportRequest, ReportFormat, ReportStatus, ReportType } from '../../../domain/models/reports.models';

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe, FormsModule],
  providers: [ReportsStore],
  template: `
    <div class="admin-page">
      <header class="admin-header">
        <div>
          <h2>Reports</h2>
          <p>Genera reportes ejecutivos PDF/CSV para la gerencia del centro comercial.</p>
          @if (store.lastSyncedAt()) {
            <p class="sync mono">Última sincronización: {{ store.lastSyncedAt() | date: 'medium' }}</p>
          }
        </div>
        <button class="btn-outline" (click)="store.refresh()" [disabled]="store.isLoading()">Refresh</button>
      </header>

      @if (store.error()) {
        <div class="banner banner-error">{{ store.error() }}</div>
      }

      <section class="panel">
        <header class="panel-header">
          <h3>Generar nuevo reporte</h3>
          <span class="tag mono">POST /reports</span>
        </header>
        <div class="form-grid">
          <label>
            <span>Nombre</span>
            <input type="text" [(ngModel)]="name" placeholder="ej. Revenue Q1 2026" />
          </label>
          <label>
            <span>Tipo</span>
            <select [(ngModel)]="type">
              @for (t of types; track t) {
                <option [ngValue]="t">{{ t }}</option>
              }
            </select>
          </label>
          <label>
            <span>Formato</span>
            <select [(ngModel)]="format">
              <option [ngValue]="ReportFormat.PDF">PDF</option>
              <option [ngValue]="ReportFormat.CSV">CSV</option>
            </select>
          </label>
          <label>
            <span>Desde</span>
            <input type="date" [(ngModel)]="periodStart" />
          </label>
          <label>
            <span>Hasta</span>
            <input type="date" [(ngModel)]="periodEnd" />
          </label>
          <button class="btn-primary" (click)="generate()" [disabled]="!isFormValid()">
            Generar reporte
          </button>
        </div>
      </section>

      <section class="panel">
        <header class="panel-header">
          <h3>Reportes generados</h3>
          <span class="tag mono">{{ store.reports().length }} disponibles</span>
        </header>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Reporte</th>
                <th>Tipo</th>
                <th>Periodo</th>
                <th>Formato</th>
                <th>Estado</th>
                <th>Tamaño</th>
                <th>Generado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (r of store.reports(); track r.id) {
                <tr>
                  <td>
                    <strong>{{ r.name }}</strong>
                    <p class="meta mono">#{{ r.id }} · por {{ r.generatedBy }}</p>
                  </td>
                  <td><span class="type-pill">{{ r.type }}</span></td>
                  <td class="mono">{{ r.periodStart }} → {{ r.periodEnd }}</td>
                  <td>{{ r.format }}</td>
                  <td>
                    <span class="badge"
                          [class.badge-cyan]="r.status === 'READY'"
                          [class.badge-warn]="r.status === 'GENERATING'"
                          [class.badge-danger]="r.status === 'FAILED'">
                      {{ r.status }}
                    </span>
                  </td>
                  <td class="mono">
                    @if (r.sizeBytes) { {{ (r.sizeBytes / 1024) | number: '1.0-0' }} KB } @else { — }
                  </td>
                  <td>{{ r.generatedAt | date: 'short' }}</td>
                  <td>
                    @if (r.status === 'READY') {
                      <button class="btn-mini" (click)="store.download(r.id)">Descargar</button>
                    } @else if (r.status === 'GENERATING') {
                      <span class="meta">generando…</span>
                    } @else {
                      <span class="meta">—</span>
                    }
                  </td>
                </tr>
              }
              @if (store.reports().length === 0) {
                <tr><td colspan="8" class="empty">Aún no hay reportes generados.</td></tr>
              }
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `,
  styles: [`
    :host { display: block; color: #dbe4e3; }
    .admin-page { display: flex; flex-direction: column; gap: 20px; }
    .admin-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap; }
    .admin-header h2 { margin: 0 0 6px; font-size: 22px; }
    .admin-header p { margin: 0; color: #b9cac9; font-size: 13px; }
    .admin-header .sync { margin-top: 4px; font-size: 11px; color: #6f7e7d; }
    .mono { font-family: 'JetBrains Mono', monospace; }
    .panel { background: #151d1d; border: 1px solid #2e3636; border-radius: 8px; padding: 18px; }
    .panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
    .panel-header h3 { margin: 0; font-size: 15px; }
    .tag { font-size: 11px; color: #b9cac9; padding: 2px 8px; background: #1f2a2a; border-radius: 8px; }
    .banner { padding: 10px 14px; border-radius: 6px; font-size: 13px; }
    .banner-error { background: rgba(255, 180, 171, 0.08); color: #ffb4ab; border: 1px solid rgba(255, 180, 171, 0.4); }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr 160px 160px 160px auto; gap: 12px; align-items: end; }
    .form-grid label { display: flex; flex-direction: column; font-size: 11px; color: #b9cac9; letter-spacing: 0.4px; gap: 6px; }
    .form-grid input, .form-grid select {
      background: #0d1514; color: #dbe4e3; border: 1px solid #2e3636; border-radius: 6px;
      padding: 8px 10px; font-family: inherit; font-size: 13px;
    }
    .btn-outline, .btn-primary, .btn-mini { font-family: inherit; cursor: pointer; border-radius: 6px; transition: opacity .15s; }
    .btn-outline { background: transparent; border: 1px solid #2e3636; color: #dbe4e3; padding: 8px 14px; font-size: 13px; }
    .btn-primary { background: #01f2f2; color: #0d1514; border: none; padding: 10px 16px; font-size: 13px; font-weight: 600; }
    .btn-mini { background: #01f2f2; color: #0d1514; border: none; padding: 6px 14px; font-size: 12px; font-weight: 600; }
    button[disabled] { opacity: 0.4; cursor: not-allowed; }
    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #2e3636; vertical-align: top; }
    th { color: #b9cac9; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.4px; }
    .meta { color: #6f7e7d; font-size: 11px; margin: 4px 0 0; }
    .badge { font-family: 'JetBrains Mono', monospace; font-size: 10px; padding: 3px 8px; border-radius: 8px; background: #1f2a2a; color: #b9cac9; }
    .badge-cyan { background: rgba(1, 242, 242, 0.12); color: #01f2f2; }
    .badge-warn { background: rgba(255, 196, 0, 0.12); color: #ffc400; }
    .badge-danger { background: rgba(255, 180, 171, 0.16); color: #ffb4ab; }
    .type-pill { font-family: 'JetBrains Mono', monospace; font-size: 10px; padding: 3px 8px; border-radius: 8px;
                 background: rgba(1, 242, 242, 0.10); color: #01f2f2; }
    .empty { color: #6f7e7d; text-align: center; padding: 22px; }
  `],
})
export class ReportsPage {
  readonly store = inject(ReportsStore);

  readonly ReportFormat = ReportFormat;
  readonly ReportStatus = ReportStatus;
  readonly ReportType = ReportType;
  readonly types: ReportType[] = [ReportType.OCCUPANCY, ReportType.REVENUE, ReportType.PEAK_HOURS, ReportType.HEATMAP];

  name = '';
  type: ReportType = ReportType.REVENUE;
  format: ReportFormat = ReportFormat.PDF;
  periodStart = new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10);
  periodEnd = new Date().toISOString().slice(0, 10);

  isFormValid(): boolean {
    return this.name.trim().length > 0 && this.periodStart <= this.periodEnd;
  }

  generate(): void {
    if (!this.isFormValid()) return;
    const req: GenerateReportRequest = {
      name: this.name.trim(),
      type: this.type,
      format: this.format,
      periodStart: this.periodStart,
      periodEnd: this.periodEnd,
    };
    this.store.generate(req);
    this.name = '';
  }
}
