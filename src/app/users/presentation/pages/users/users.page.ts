import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersStore } from '../../../application/store/users.store';
import { CreateAdminRequest, UserRole } from '../../../domain/models/users.models';

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule],
  providers: [UsersStore],
  template: `
    <div class="admin-page">
      <header class="admin-header">
        <div>
          <h2>Users</h2>
          <p>Administradores del centro comercial y conductores registrados.</p>
          @if (store.lastSyncedAt()) {
            <p class="sync mono">Última sincronización: {{ store.lastSyncedAt() | date: 'medium' }}</p>
          }
        </div>
        <button class="btn-outline" (click)="store.refresh()" [disabled]="store.isLoading()">Refresh</button>
      </header>

      @if (store.error()) {
        <div class="banner banner-error">{{ store.error() }}</div>
      }

      <section class="kpis">
        <article class="kpi">
          <span class="label">TOTAL</span><strong>{{ store.users().length }}</strong>
          <p class="meta">{{ store.activeCount() }} activos</p>
        </article>
        <article class="kpi">
          <span class="label">ADMINISTRADORES</span><strong>{{ store.adminCount() }}</strong>
        </article>
        <article class="kpi">
          <span class="label">CONDUCTORES</span><strong>{{ store.driverCount() }}</strong>
        </article>
      </section>

      <section class="panel">
        <header class="panel-header">
          <h3>Crear administrador</h3>
          <span class="tag mono">POST /auth/register</span>
        </header>
        <div class="form-grid">
          <label><span>Nombre</span><input type="text" [(ngModel)]="firstName" /></label>
          <label><span>Apellido</span><input type="text" [(ngModel)]="lastName" /></label>
          <label><span>Correo</span><input type="email" [(ngModel)]="email" placeholder="admin@spotfinder.pe" /></label>
          <label><span>Contraseña inicial</span><input type="text" [(ngModel)]="initialPassword" placeholder="generada por el sistema" /></label>
          <button class="btn-primary" (click)="createAdmin()" [disabled]="!isFormValid()">Crear administrador</button>
        </div>
      </section>

      <section class="panel">
        <header class="panel-header">
          <h3>Usuarios</h3>
          <div class="toggle-group">
            <button [class.active]="store.filter() === 'ALL'" (click)="store.setFilter('ALL')">Todos</button>
            <button [class.active]="store.filter() === UserRole.ADMIN" (click)="store.setFilter(UserRole.ADMIN)">Admins</button>
            <button [class.active]="store.filter() === UserRole.CAR_OWNER" (click)="store.setFilter(UserRole.CAR_OWNER)">Conductores</button>
          </div>
        </header>
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Estado</th><th>Último ingreso</th><th>Creado</th><th></th></tr>
            </thead>
            <tbody>
              @for (u of store.filteredUsers(); track u.id) {
                <tr>
                  <td><strong>{{ u.firstName }} {{ u.lastName }}</strong><p class="meta mono">#{{ u.id }}</p></td>
                  <td>{{ u.email }}</td>
                  <td>
                    @for (r of u.roles; track r) {
                      <span class="badge" [class.badge-cyan]="r === 'ADMIN'" [class.badge-driver]="r === 'CAR_OWNER'">{{ r }}</span>
                    }
                  </td>
                  <td>
                    <span class="badge" [class.badge-cyan]="u.active" [class.badge-danger]="!u.active">
                      {{ u.active ? 'ACTIVO' : 'DESACTIVADO' }}
                    </span>
                  </td>
                  <td>{{ u.lastLoginAt ? (u.lastLoginAt | date: 'short') : '—' }}</td>
                  <td>{{ u.createdAt | date: 'shortDate' }}</td>
                  <td>
                    <button class="btn-mini-ghost" (click)="store.toggleActive(u.id)">
                      {{ u.active ? 'Desactivar' : 'Reactivar' }}
                    </button>
                  </td>
                </tr>
              }
              @if (store.filteredUsers().length === 0) {
                <tr><td colspan="7" class="empty">No hay usuarios para el filtro seleccionado.</td></tr>
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
    .kpis { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .kpi { background: #151d1d; border: 1px solid #2e3636; border-radius: 8px; padding: 18px; display: flex; flex-direction: column; gap: 6px; }
    .kpi .label { font-size: 11px; color: #b9cac9; letter-spacing: 0.5px; }
    .kpi strong { font-size: 26px; color: #01f2f2; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
    .kpi .meta { margin: 0; color: #6f7e7d; font-size: 12px; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr 1.5fr 1fr auto; gap: 12px; align-items: end; }
    .form-grid label { display: flex; flex-direction: column; font-size: 11px; color: #b9cac9; letter-spacing: 0.4px; gap: 6px; }
    .form-grid input {
      background: #0d1514; color: #dbe4e3; border: 1px solid #2e3636; border-radius: 6px;
      padding: 8px 10px; font-family: inherit; font-size: 13px;
    }
    .toggle-group { display: flex; gap: 4px; padding: 3px; background: #0d1514; border: 1px solid #2e3636; border-radius: 8px; }
    .toggle-group button { background: transparent; color: #b9cac9; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; font-family: inherit; }
    .toggle-group button.active { background: #1f2a2a; color: #01f2f2; }
    .btn-outline, .btn-primary, .btn-mini-ghost { font-family: inherit; cursor: pointer; border-radius: 6px; transition: opacity .15s; }
    .btn-outline { background: transparent; border: 1px solid #2e3636; color: #dbe4e3; padding: 8px 14px; font-size: 13px; }
    .btn-primary { background: #01f2f2; color: #0d1514; border: none; padding: 10px 16px; font-size: 13px; font-weight: 600; }
    .btn-mini-ghost { background: transparent; border: 1px solid #2e3636; color: #b9cac9; padding: 6px 12px; font-size: 12px; }
    button[disabled] { opacity: 0.4; cursor: not-allowed; }
    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #2e3636; vertical-align: top; }
    th { color: #b9cac9; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.4px; }
    .meta { color: #6f7e7d; font-size: 11px; margin: 4px 0 0; }
    .badge { font-family: 'JetBrains Mono', monospace; font-size: 10px; padding: 3px 8px; border-radius: 8px; background: #1f2a2a; color: #b9cac9; margin-right: 4px; display: inline-block; }
    .badge-cyan { background: rgba(1, 242, 242, 0.12); color: #01f2f2; }
    .badge-driver { background: rgba(255, 196, 0, 0.12); color: #ffc400; }
    .badge-danger { background: rgba(255, 180, 171, 0.16); color: #ffb4ab; }
    .empty { color: #6f7e7d; text-align: center; padding: 22px; }
  `],
})
export class UsersPage {
  readonly store = inject(UsersStore);
  readonly UserRole = UserRole;

  firstName = '';
  lastName = '';
  email = '';
  initialPassword = '';

  isFormValid(): boolean {
    return this.firstName.trim().length > 0 &&
           this.lastName.trim().length > 0 &&
           /\S+@\S+\.\S+/.test(this.email) &&
           this.initialPassword.length >= 6;
  }

  createAdmin(): void {
    if (!this.isFormValid()) return;
    const req: CreateAdminRequest = {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      initialPassword: this.initialPassword,
    };
    this.store.createAdmin(req);
    this.firstName = '';
    this.lastName = '';
    this.email = '';
    this.initialPassword = '';
  }
}
