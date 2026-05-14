import { Routes } from '@angular/router';
import { authGuard } from './iam/application/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./iam/presentation/pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./iam/presentation/pages/register/register.component').then(m => m.RegisterComponent)
  },
  {
    // Rutas protegidas (Requieren Login)
    path: '',
    loadComponent: () => import('./shared/components/layout/dashboard-layout.component').then(m => m.DashboardLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./analytics/presentation/pages/analytics/analytics.page').then(m => m.AnalyticsPage) },
      { path: 'analytics', loadComponent: () => import('./analytics/presentation/pages/analytics/analytics.page').then(m => m.AnalyticsPage) },
      { path: 'parking', loadComponent: () => import('./parking-monitoring/presentation/pages/monitoring/monitoring.page').then(m => m.MonitoringPage) },


      { path: 'access-control', loadComponent: () => import('./analytics/presentation/pages/analytics/analytics.page').then(m => m.AnalyticsPage) },
      { path: 'emergency', loadComponent: () => import('./analytics/presentation/pages/analytics/analytics.page').then(m => m.AnalyticsPage) },


      { path: 'payments', loadComponent: () => import('./payments/presentation/pages/payments/payments.page').then(m => m.PaymentsPage) },

      { path: 'reports', loadComponent: () => import('./analytics/presentation/pages/analytics/analytics.page').then(m => m.AnalyticsPage) },
      { path: 'users', loadComponent: () => import('./analytics/presentation/pages/analytics/analytics.page').then(m => m.AnalyticsPage) },
      { path: 'settings', loadComponent: () => import('./analytics/presentation/pages/analytics/analytics.page').then(m => m.AnalyticsPage) }
    ]
  }
];
