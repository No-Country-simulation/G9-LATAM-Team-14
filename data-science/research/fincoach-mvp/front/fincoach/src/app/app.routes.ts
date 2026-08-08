import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth-guard';
import { guestGuard } from './core/guards/guest-guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/pages/landing/landing').then(
        (component) => component.Landing,
      ),
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/pages/login/login').then(
        (component) => component.Login,
      ),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/pages/register/register').then(
        (component) => component.Register,
      ),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    data: { profileMode: 'create' },
    loadComponent: () =>
      import('./features/profile/pages/profile/profile').then(
        (component) => component.Profile,
      ),
  },
  {
    path: 'me',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/pages/overview/overview').then(
        (component) => component.Overview,
      ),
  },
  {
    path: 'edit-profile',
    canActivate: [authGuard],
    data: { profileMode: 'detail' },
    loadComponent: () =>
      import('./features/profile/pages/profile/profile').then(
        (component) => component.Profile,
      ),
  },
  {
    path: 'transactions',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/transactions/pages/transactions/transactions').then(
        (component) => component.Transactions,
      ),
  },
  {
    path: 'monthly-analysis',
    canActivate: [authGuard],
    loadComponent: () =>
      import(
        './features/monthly-analysis/pages/monthly-analysis/monthly-analysis'
      ).then((component) => component.MonthlyAnalysis),
  },
  {
    path: 'debts',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/debts/pages/debts/debts').then(
        (component) => component.Debts,
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
