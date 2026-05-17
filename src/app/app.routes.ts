import { Routes } from '@angular/router';
import { authGuard } from './iam/application/guards/auth.guard';
import { adminRoleGuard } from './iam/application/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./iam/presentation/pages/login/login.page').then((m) => m.LoginPage)
  },
  {
    path: 'auth/register',
    loadComponent: () =>
      import('./iam/presentation/pages/register/register.component').then(
        (m) => m.RegisterComponent
      )
  },
  {
    // Rutas protegidas — requieren JWT y rol admin
    path: '',
    loadComponent: () =>
      import('./shared/components/layout/dashboard-layout.component').then(
        (m) => m.DashboardLayoutComponent
      ),
    canActivate: [authGuard, adminRoleGuard],
    children: [
      { path: 'dashboard', pathMatch: 'full', redirectTo: 'analytics' },
      {
        path: 'analytics',
        loadComponent: () =>
          import('./analytics/presentation/pages/analytics/analytics.page').then(
            (m) => m.AnalyticsPage
          )
      },
      {
        path: 'parking',
        loadComponent: () =>
          import(
            './parking-monitoring/presentation/pages/monitoring/monitoring.page'
          ).then((m) => m.MonitoringPage)
      },
      {
        path: 'access-control',
        loadComponent: () =>
          import('./access-control/presentation/pages/access-control.page').then(
            (m) => m.AccessControlPage
          )
      },
      {
        path: 'emergency',
        loadComponent: () =>
          import('./emergency/presentation/pages/emergency.page').then(
            (m) => m.EmergencyPage
          )
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import(
            './notifications/presentation/pages/notifications/notifications.page'
          ).then((m) => m.NotificationsPage)
      },
      {
        path: 'payments',
        loadComponent: () =>
          import('./payments/presentation/pages/payments/payments.page').then(
            (m) => m.PaymentsPage
          )
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./reports/presentation/pages/reports.page').then(
            (m) => m.ReportsPage
          )
      },
      {
        path: 'users',
        loadComponent: () =>
          import(
            './user-management/presentation/pages/user-management.page'
          ).then((m) => m.UserManagementPage)
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./settings/presentation/pages/settings.page').then(
            (m) => m.SettingsPage
          )
      }
    ]
  },
  {
    path: '**',
    loadComponent: () =>
      import('./shared/components/not-found/not-found.page').then(
        (m) => m.NotFoundPage
      )
  }
];
