import { Routes } from '@angular/router';
export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./features/landing/landing').then(m => m.Landing)
    },
    {
        path: 'login',
        loadComponent: () => import('./features/auth/auth').then(m => m.Auth)
    },
    {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES)
    },
    {
        path: 'registro',
        loadComponent: () => import('./features/register/register').then(m => m.Register)
    },
    {
        path: 'onboarding',
        loadComponent: () => import('./features/onboarding/onboarding').then(m => m.Onboarding)
    },
    {
        path: '**',
        redirectTo: ''
    }
];
