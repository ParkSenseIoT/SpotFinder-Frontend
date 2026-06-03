import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AccessControlStore } from '../../../application/store/access-control.store';
import { BarrierStatus, SessionPaymentStatus } from '../../../domain/models/access-control.models';

@Component({
  selector: 'app-access-control-page',
  standalone: true,
  imports: [CommonModule, DatePipe],
  providers: [AccessControlStore],
  template: `
    <div class="admin-page">
      <header class="admin-header">
        <div>
          <h2>Access Control</h2>
          <p>Barreras físicas y sesiones vehiculares activas en este momento.</p>
          @if (store.lastSyncedAt()) {
            <p class="sync mono">Última sincronización: {{ store.lastSyncedAt() | date: 'medium' }}</p>
          }
        </div>
        <div class="actions">
          <button class="btn-outline" (click)="store.refresh()" [disabled]="store.isLoading()">Refresh</button>
          <button class="btn-danger" (click)="confirmOpenAll()" [disabled]="store.isLoading()">
            🚨 Open all barriers
          </button>
        </div>
      </header>

      @if (store.error()) {
        <div class="banner banner-error">{{ store.error() }}</div>
      }

      <section class="panel">
        <header class="panel-header">
          <h3>Barreras</h3>
          <span class="tag mono">{{ store.barriers().length }} barreras</span>
        </header>
        <div class="barrier-grid">
          @for (b of store.barriers(); track b.id) {
            <article class="barrier-card" [class.is-open]="b.status === 'OPEN'">
              <div class="row">
                <span class="code">{{ b.code }}</span>
                <span class="badge" [class.badge-cyan]="b.status === 'OPEN'">{{ b.status }}</span>
              </div>
              <p class="meta">{{ b.position }} · {{ b.facility }}</p>
              <p class="meta dim">Último evento: {{ b.lastEvent }}</p>
              <div class="card-actions">
                <button
                  class="btn-mini"
                  (click)="store.openBarrier(b.id)"
                  [disabled]="b.status === 'OPEN'">Abrir</button>
                <button
                  class="btn-mini-ghost"
                  (click)="store.closeBarrier(b.id)"
                  [disabled]="b.status === 'CLOSED'">Cerrar</button>
              </div>
            </article>
          }
        </div>
      </section>

      <section class="panel">
        <header class="panel-header">
          <h3>Sesiones activas</h3>
          <span class="tag mono">{{ store.sessions().length }} vehículos dentro</span>
        </header>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Placa</th>
                <th>Espacio</th>
                <th>Ingreso</th>
                <th>Tiempo</th>
                <th>Pago</th>
                <th>Usuario</th>
              </tr>
            </thead>
            <tbody>
              @for (s of store.sessions(); track s.id) {
                <tr>
                  <td class="mono">{{ s.plate }}</td>
                  <td>{{ s.slotCode ?? '—' }}</td>
                  <td>{{ s.entryTimestamp | date: 'short' }}</td>
                  <td>{{ stayLabel(s.entryTimestamp) }}</td>
                  <td>
                    <span class="badge" [class.badge-cyan]="s.paymentStatus === 'PAID'"
                                       [class.badge-warn]="s.paymentStatus === 'PENDING'">
                      {{ s.paymentStatus }}
                    </span>
                  </td>
                  <td>{{ s.userEmail ?? 'No registrado' }}</td>
                </tr>
              }
              @if (store.sessions().length === 0) {
                <tr><td colspan="6" class="empty">No hay vehículos dentro del estacionamiento.</td></tr>
              }
            </tbody>
          </table>
        </div>
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
    .panel { background: #151d1d; border: 1px solid #2e3636; border-radius: 8px; padding: 18px; }
    .panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
    .panel-header h3 { margin: 0; font-size: 15px; color: #dbe4e3; }
    .tag { font-size: 11px; color: #b9cac9; padding: 2px 8px; background: #1f2a2a; border-radius: 8px; }
    .banner { padding: 10px 14px; border-radius: 6px; font-size: 13px; }
    .banner-error { background: rgba(255, 180, 171, 0.08); color: #ffb4ab; border: 1px solid rgba(255, 180, 171, 0.4); }
    .barrier-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
    .barrier-card { background: #0d1514; border: 1px solid #2e3636; border-radius: 8px; padding: 14px; transition: border-color .15s; }
    .barrier-card.is-open { border-color: #01f2f2; box-shadow: 0 0 0 1px rgba(1,242,242,0.18); }
    .barrier-card .row { display: flex; justify-content: space-between; align-items: center; }
    .barrier-card .code { font-family: 'JetBrains Mono', monospace; font-weight: 600; }
    .barrier-card .meta { margin: 8px 0 2px; font-size: 12px; color: #b9cac9; }
    .barrier-card .meta.dim { color: #6f7e7d; }
    .barrier-card .card-actions { display: flex; gap: 8px; margin-top: 12px; }
    .badge { font-family: 'JetBrains Mono', monospace; font-size: 10px; padding: 2px 8px; border-radius: 8px; background: #1f2a2a; color: #b9cac9; }
    .badge-cyan { background: rgba(1, 242, 242, 0.12); color: #01f2f2; }
    .badge-warn { background: rgba(255, 196, 0, 0.12); color: #ffc400; }
    .btn-outline, .btn-danger, .btn-mini, .btn-mini-ghost { font-family: inherit; cursor: pointer; border-radius: 6px; transition: opacity .15s; }
    .btn-outline { background: transparent; border: 1px solid #2e3636; color: #dbe4e3; padding: 8px 14px; font-size: 13px; }
    .btn-danger { background: #ffb4ab; color: #0d1514; border: none; padding: 8px 14px; font-size: 13px; font-weight: 600; }
    .btn-mini { background: #01f2f2; color: #0d1514; border: none; padding: 6px 12px; font-size: 12px; font-weight: 600; }
    .btn-mini-ghost { background: transparent; border: 1px solid #2e3636; color: #b9cac9; padding: 6px 12px; font-size: 12px; }
    button[disabled] { opacity: 0.4; cursor: not-allowed; }
    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #2e3636; }
    th { color: #b9cac9; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.4px; }
    .empty { color: #6f7e7d; text-align: center; padding: 22px; }
  `],
})
export class AccessControlPage {
  readonly store = inject(AccessControlStore);

  readonly BarrierStatus = BarrierStatus;
  readonly SessionPaymentStatus = SessionPaymentStatus;

  stayLabel(entry: string): string {
    const ms = Date.now() - new Date(entry).getTime();
    if (Number.isNaN(ms) || ms < 0) return '—';
    const hh = Math.floor(ms / 3_600_000);
    const mm = Math.floor((ms % 3_600_000) / 60_000);
    return `${hh}h ${mm.toString().padStart(2, '0')}m`;
  }

  confirmOpenAll(): void {
    if (confirm('¿Abrir todas las barreras? Esta acción es para evacuaciones de emergencia.')) {
      this.store.openAll();
    }
  }
}
