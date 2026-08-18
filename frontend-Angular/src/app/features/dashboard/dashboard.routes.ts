import { Routes } from '@angular/router';
import { Dashboard } from './dashboard';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: Dashboard,
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full'
      },
      {
        path: 'overview',
        title: 'Fincoach | Resumen General',
        loadComponent: () => import('./pages/overview/overview').then(m => m.Overview)
      },
      {
        path: 'profile',
        title: 'Fincoach | Perfil Financiero',
        loadComponent: () => import('./pages/profile/profile').then(m => m.Profile)
      },
      {
        path: 'finances',
        title: 'Fincoach | Diagnóstico e IA',
        loadComponent: () => import('./pages/finances/finances').then(m => m.Finances)
      },
      {
        path: 'movements',
        title: 'Fincoach | Registro de Movimientos',
        loadComponent: () => import('./pages/movements/movements').then(m => m.Movements)
      },
      {
        path: 'debts',
        title: 'Fincoach | Gestión de Deudas',
        loadComponent: () => import('./pages/debts/debts').then(m => m.Debts)
      },
      {
        path: 'evolution',
        title: 'Fincoach | Evolución Financiera',
        loadComponent: () => import('./pages/evolution/evolution').then(m => m.Evolution)
      },
      {
        path: 'settings',
        title: 'Fincoach | Configuración',
        loadComponent: () => import('./pages/settings/settings').then(m => m.Settings)
      }
    ]
  }
];