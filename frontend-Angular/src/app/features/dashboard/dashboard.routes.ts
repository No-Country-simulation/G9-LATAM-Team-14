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
        loadComponent: () => import('./pages/overview/overview').then(m => m.Overview)
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile').then(m => m.Profile)
      },
      {
        path: 'finances',
        loadComponent: () => import('./pages/finances/finances').then(m => m.Finances)
      },
      {
        path: 'movements',
        loadComponent: () => import('./pages/movements/movements').then(m => m.Movements)
      },
      {
        path: 'debts',
        loadComponent: () => import('./pages/debts/debts').then(m => m.Debts)
      },
      {
        path: 'evolution',
        loadComponent: () => import('./pages/evolution/evolution').then(m => m.Evolution)
      }
    ]
  }
];
