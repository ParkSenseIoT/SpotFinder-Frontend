import { Component, computed, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FacilitySettingsStore } from '../../../application/store/facility-settings.store';
import { FacilitySettings } from '../../../domain/models/facility-settings.models';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule],
  providers: [FacilitySettingsStore],
  template: `
    <div class="admin-page">
      <header class="admin-header">
        <div>
          <h2>Facility Settings</h2>
          <p>Configuración del estacionamiento, tarificación y umbrales de los sensores IoT.</p>
          @if (store.lastSavedAt()) {
            <p class="sync mono">Última actualización: {{ store.lastSavedAt() | date: 'medium' }}</p>
          }
        </div>
        <button class="btn-outline" (click)="store.refresh()" [disabled]="store.isLoading()">Refresh</button>
      </header>

      @if (store.error()) { <div class="banner banner-error">{{ store.error() }}</div> }

      @if (form()) {
        <div class="settings-grid">
          <section class="panel">
            <header class="panel-header"><h3>Identificación</h3><span class="tag mono">facility</span></header>
            <label><span>Nombre del estacionamiento</span><input type="text" [(ngModel)]="form()!.facilityName" /></label>
            <label><span>Dirección</span><input type="text" [(ngModel)]="form()!.address" /></label>
            <label><span>Identificador</span><input type="text" [(ngModel)]="form()!.facilityId" readonly /></label>
            <label><span>Espacios totales</span><input type="number" min="1" [(ngModel)]="form()!.totalSlots" /></label>
          </section>

          <section class="panel">
            <header class="panel-header"><h3>Tarificación</h3><span class="tag mono">pricing</span></header>
            <label><span>Moneda</span>
              <select [(ngModel)]="form()!.currency">
                <option value="PEN">PEN — Soles</option>
                <option value="USD">USD — Dólares</option>
              </select>
            </label>
            <label><span>Tarifa por hora</span><input type="number" min="0" step="0.5" [(ngModel)]="form()!.ratePerHour" /></label>
            <label><span>Grace period (min)</span><input type="number" min="0" max="60" [(ngModel)]="form()!.gracePeriodMinutes" /></label>
          </section>

          <section class="panel">
            <header class="panel-header"><h3>Sensores IoT</h3><span class="tag mono">thresholds</span></header>
            <label><span>Umbral ultrasónico (cm)</span><input type="number" min="20" max="400" [(ngModel)]="form()!.sensorThresholdCm" /></label>
            <label><span>Gas MQ-2 (PPM evacuación)</span><input type="number" min="200" max="3000" [(ngModel)]="form()!.evacuationGasPpm" /></label>
          </section>

          <section class="panel">
            <header class="panel-header"><h3>Contacto operativo</h3><span class="tag mono">support</span></header>
            <label><span>Correo del operador</span><input type="email" [(ngModel)]="form()!.contactEmail" /></label>
            <label><span>Teléfono / WhatsApp</span><input type="tel" [(ngModel)]="form()!.contactPhone" /></label>
          </section>

          <section class="panel">
            <header class="panel-header"><h3>Capacidades habilitadas</h3><span class="tag mono">features</span></header>
            <label class="check"><input type="checkbox" [(ngModel)]="form()!.enableAlpr" /><span>Reconocimiento automático de placas (ALPR)</span></label>
            <label class="check"><input type="checkbox" [(ngModel)]="form()!.enableLedGuidance" /><span>Guiado visual con LEDs WS2812B</span></label>
            <label class="check"><input type="checkbox" [(ngModel)]="form()!.enableEmergencyProtocol" /><span>Protocolo de emergencia automático</span></label>
          </section>
        </div>

        <div class="actions">
          <button class="btn-outline" (click)="store.refresh()" [disabled]="store.isSaving()">Descartar</button>
          <button class="btn-primary" (click)="save()" [disabled]="store.isSaving()">
            {{ store.isSaving() ? 'Guardando…' : 'Guardar cambios' }}
          </button>
        </div>
      } @else {
        <div class="panel">Cargando configuración…</div>
      }
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
    .panel { background: #151d1d; border: 1px solid #2e3636; border-radius: 8px; padding: 18px; display: flex; flex-direction: column; gap: 14px; }
    .panel-header { display: flex; justify-content: space-between; align-items: center; }
    .panel-header h3 { margin: 0; font-size: 15px; }
    .tag { font-size: 11px; color: #b9cac9; padding: 2px 8px; background: #1f2a2a; border-radius: 8px; }
    .banner { padding: 10px 14px; border-radius: 6px; font-size: 13px; }
    .banner-error { background: rgba(255, 180, 171, 0.08); color: #ffb4ab; border: 1px solid rgba(255, 180, 171, 0.4); }
    .settings-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
    label { display: flex; flex-direction: column; font-size: 11px; color: #b9cac9; letter-spacing: 0.4px; gap: 6px; }
    label.check { flex-direction: row; align-items: center; gap: 10px; }
    label.check span { color: #dbe4e3; font-size: 13px; letter-spacing: 0; }
    label input, label select {
      background: #0d1514; color: #dbe4e3; border: 1px solid #2e3636; border-radius: 6px;
      padding: 8px 10px; font-family: inherit; font-size: 13px;
    }
    label input[readonly] { color: #6f7e7d; }
    label.check input { width: 16px; height: 16px; }
    .actions { display: flex; justify-content: flex-end; gap: 8px; }
    .btn-outline, .btn-primary { font-family: inherit; cursor: pointer; border-radius: 6px; transition: opacity .15s; }
    .btn-outline { background: transparent; border: 1px solid #2e3636; color: #dbe4e3; padding: 10px 18px; font-size: 13px; }
    .btn-primary { background: #01f2f2; color: #0d1514; border: none; padding: 10px 22px; font-size: 13px; font-weight: 600; }
    button[disabled] { opacity: 0.4; cursor: not-allowed; }
  `],
})
export class SettingsPage {
  readonly store = inject(FacilitySettingsStore);

  /** Local editable copy derived from the store. We clone on each store read so two-way binding doesn't mutate state directly. */
  readonly form = computed<FacilitySettings | null>(() => {
    const s = this.store.settings();
    return s ? { ...s } : null;
  });

  save(): void {
    const f = this.form();
    if (!f) return;
    this.store.save(f);
  }
}
