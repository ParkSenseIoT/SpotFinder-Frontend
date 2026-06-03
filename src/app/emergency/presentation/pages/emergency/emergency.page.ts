import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { EmergencyStore } from '../../../application/store/emergency.store';
import { EmergencyAlert, EmergencyStatus, EmergencyType } from '../../../domain/models/emergency.models';

@Component({
  selector: 'app-emergency-page',
  standalone: true,
  imports: [CommonModule, DatePipe],
  providers: [EmergencyStore],
  template: `
    <div class="admin-page">
      <header class="admin-header">
        <div>
          <h2>Emergency Center</h2>
          <p>Alertas de gas, humo y fuego detectadas por los sensores MQ-2 del estacionamiento.</p>
          @if (store.lastSyncedAt()) {
            <p class="sync mono">Última sincronización: {{ store.lastSyncedAt() | date: 'medium' }}</p>
          }
        </div>
        <div class="actions">
          <button class="btn-outline" (click)="store.refresh()" [disabled]="store.isLoading()">Refresh</button>
          @if (store.status()?.evacuationActive) {
            <button class="btn-danger" (click)="store.clearEvacuation()">✓ Cerrar evacuación</button>
          } @else {
            <button class="btn-danger" (click)="confirmEvacuation()">🚨 Activar evacuación</button>
          }
        </div>
      </header>

      @if (store.error()) {
        <div class="banner banner-error">{{ store.error() }}</div>
      }

      @if (store.status(); as s) {
        <section class="status-row">
          <article class="status-card" [class.is-active]="s.hasActiveEmergency">
            <span class="label">ESTADO GLOBAL</span>
            <strong>{{ s.hasActiveEmergency ? 'EMERGENCIA ACTIVA' : 'OPERATIVO' }}</strong>
            <p class="meta">{{ s.facility }}</p>
          </article>
          <article class="status-card" [class.is-active]="s.activeAlertCount > 0">
            <span class="label">ALERTAS ACTIVAS</span>
            <strong>{{ s.activeAlertCount }}</strong>
            <p class="meta">Sensores reportando umbral</p>
          </article>
          <article class="status-card" [class.is-active]="s.evacuationActive">
            <span class="label">EVACUACIÓN</span>
            <strong>{{ s.evacuationActive ? 'EN CURSO' : 'NO ACTIVA' }}</strong>
            <p class="meta">Apertura masiva de barreras</p>
          </article>
        </section>
      }

      <section class="panel">
        <header class="panel-header">
          <h3>Alertas</h3>
          <span class="tag mono">{{ store.alerts().length }} registros</span>
        </header>

        @for (a of store.alerts(); track a.id) {
          <article class="alert-row" [class.is-active]="a.status === 'ACTIVE'">
            <div class="alert-main">
              <div class="alert-title">
                <span class="badge" [class.badge-danger]="a.status === 'ACTIVE'"
                                   [class.badge-cyan]="a.status === 'RESOLVED'">
                  {{ a.status }}
                </span>
                <span class="type-pill" [attr.data-type]="a.type">{{ a.type }}</span>
                <span class="mono dim">#{{ a.id }}</span>
              </div>
              <p class="loc">{{ a.sensorLocation }}</p>
              <p class="meta">
                Sensor <span class="mono">{{ a.sensorId }}</span> · {{ a.gasLevel }} PPM ·
                disparada el {{ a.triggeredAt | date: 'short' }}
                @if (a.resolvedAt) {
                  · resuelta el {{ a.resolvedAt | date: 'short' }} por {{ a.resolvedBy }}
                }
              </p>
            </div>
            @if (a.status === 'ACTIVE') {
              <button class="btn-mini" (click)="resolve(a)">Marcar resuelta</button>
            }
          </article>
        }
        @if (store.alerts().length === 0) {
          <p class="empty">No hay alertas registradas.</p>
        }
      </section>
    </div>
  `,
  styles: [`
    :host { display: block; color: #dbe4e3; }
    .admin-page { display: flex; flex-direction: column; gap: 20px; padding: 4px 0; }
    .admin-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap; }
    .admin-header h2 { margin: 0 0 6px; font-size: 22px; }
    .admin-header p { margin: 0; color: #b9cac9; font-size: 13px; }
    .admin-header .sync { margin-top: 4px; font-size: 11px; color: #6f7e7d; }
    .actions { display: flex; gap: 8px; }
    .mono { font-family: 'JetBrains Mono', monospace; }
    .dim { color: #6f7e7d; }
    .panel { background: #151d1d; border: 1px solid #2e3636; border-radius: 8px; padding: 18px; }
    .panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
    .panel-header h3 { margin: 0; font-size: 15px; }
    .tag { font-size: 11px; color: #b9cac9; padding: 2px 8px; background: #1f2a2a; border-radius: 8px; }
    .banner { padding: 10px 14px; border-radius: 6px; font-size: 13px; }
    .banner-error { background: rgba(255, 180, 171, 0.08); color: #ffb4ab; border: 1px solid rgba(255, 180, 171, 0.4); }
    .status-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .status-card { background: #151d1d; border: 1px solid #2e3636; border-radius: 8px; padding: 18px; display: flex; flex-direction: column; gap: 6px; }
    .status-card.is-active { border-color: #ffb4ab; box-shadow: 0 0 0 1px rgba(255,180,171,0.18); }
    .status-card .label { font-size: 11px; color: #b9cac9; letter-spacing: 0.5px; }
    .status-card strong { font-size: 18px; font-weight: 700; color: #dbe4e3; }
    .status-card.is-active strong { color: #ffb4ab; }
    .status-card .meta { margin: 0; font-size: 12px; color: #6f7e7d; }
    .alert-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;
                 padding: 14px 0; border-bottom: 1px solid #1f2a2a; }
    .alert-row.is-active { background: rgba(255, 180, 171, 0.04); padding-left: 12px; padding-right: 12px; border-radius: 6px; margin-bottom: 6px; border-bottom: 1px solid transparent; }
    .alert-row:last-child { border-bottom: none; }
    .alert-title { display: flex; gap: 8px; align-items: center; }
    .alert-main p { margin: 6px 0 0; }
    .loc { color: #dbe4e3; font-size: 14px; }
    .meta { color: #b9cac9; font-size: 12px; }
    .badge { font-family: 'JetBrains Mono', monospace; font-size: 10px; padding: 3px 8px; border-radius: 8px; background: #1f2a2a; color: #b9cac9; }
    .badge-cyan { background: rgba(1, 242, 242, 0.12); color: #01f2f2; }
    .badge-danger { background: rgba(255, 180, 171, 0.16); color: #ffb4ab; }
    .type-pill { font-family: 'JetBrains Mono', monospace; font-size: 10px; padding: 3px 8px; border-radius: 8px;
                 background: rgba(255, 196, 0, 0.12); color: #ffc400; }
    .type-pill[data-type='FIRE'] { background: rgba(255, 100, 100, 0.16); color: #ff8a80; }
    .type-pill[data-type='SMOKE'] { background: rgba(200, 200, 200, 0.16); color: #cfcfcf; }
    .btn-outline, .btn-danger, .btn-mini { font-family: inherit; cursor: pointer; border-radius: 6px; transition: opacity .15s; }
    .btn-outline { background: transparent; border: 1px solid #2e3636; color: #dbe4e3; padding: 8px 14px; font-size: 13px; }
    .btn-danger { background: #ffb4ab; color: #0d1514; border: none; padding: 8px 14px; font-size: 13px; font-weight: 600; }
    .btn-mini { background: #01f2f2; color: #0d1514; border: none; padding: 6px 14px; font-size: 12px; font-weight: 600; }
    button[disabled] { opacity: 0.4; cursor: not-allowed; }
    .empty { color: #6f7e7d; text-align: center; padding: 22px; margin: 0; }
  `],
})
export class EmergencyPage {
  readonly store = inject(EmergencyStore);

  readonly EmergencyStatus = EmergencyStatus;
  readonly EmergencyType = EmergencyType;

  resolve(alert: EmergencyAlert): void {
    const reason = prompt('Describe brevemente cómo se resolvió la emergencia:', 'Verificación in situ — falso positivo.');
    if (reason === null) return;
    this.store.resolve({ id: alert.id, operatorEmail: 'operator@spotfinder.pe' });
  }

  confirmEvacuation(): void {
    if (confirm('Activar la evacuación abrirá todas las barreras y enviará alertas masivas. ¿Continuar?')) {
      this.store.triggerEvacuation();
    }
  }
}
