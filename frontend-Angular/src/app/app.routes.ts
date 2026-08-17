import { Routes } from '@angular/router';
import { authGuard, guestGuard, onboardingGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        title: 'Fincoach | Gestión Financiera Inteligente impulsada por IA',
        loadComponent: () => import('./features/landing/landing').then(m => m.Landing)
    },
    {
        path: 'login',
        title: 'Fincoach | Iniciar Sesión',
        canActivate: [guestGuard],
        loadComponent: () => import('./features/auth/auth').then(m => m.Auth)
    },
    {
        path: 'registro',
        title: 'Fincoach | Crear Cuenta',
        canActivate: [guestGuard],
        loadComponent: () => import('./features/register/register').then(m => m.Register)
    },
    {
        path: 'dashboard',
        canActivate: [authGuard],
        loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES)
    },
    {
        path: 'onboarding',
        title: 'Fincoach | Configuración Inicial',
        canActivate: [onboardingGuard],
        loadComponent: () => import('./features/onboarding/onboarding').then(m => m.Onboarding)
    },
    {
        path: '**',
        redirectTo: ''
    }
];
