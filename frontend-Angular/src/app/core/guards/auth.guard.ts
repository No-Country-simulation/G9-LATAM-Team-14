import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/auth/services/auth.service';
import { map, of } from 'rxjs';

/** Guard que protege rutas privadas (Dashboard, Onboarding). */
export const authGuard: CanActivateFn = () => {
  const platformId = inject(PLATFORM_ID);
  if (isPlatformServer(platformId)) {
    return of(true);
  }

  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.checkSession().pipe(
    map((isAuthenticated) => {
      if (isAuthenticated) {
        return true;
      }
      return router.createUrlTree(['/login']);
    })
  );
};

/** Guard para rutas públicas de autenticación (Login, Registro). */
export const guestGuard: CanActivateFn = () => {
  const platformId = inject(PLATFORM_ID);
  if (isPlatformServer(platformId)) {
    return of(true);
  }
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.checkSession().pipe(
    map((isAuthenticated) => {
      if (isAuthenticated) {
        return router.createUrlTree(['/dashboard']);
      }
      return true;
    })
  );
};
