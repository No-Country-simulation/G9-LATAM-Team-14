import { Routes } from '@angular/router';
import { Dashboard } from './dashboard';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: Dashboard,
    children: []
  }
];