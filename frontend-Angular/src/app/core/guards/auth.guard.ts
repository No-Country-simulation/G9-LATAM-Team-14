import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/auth/services/auth.service';
import { map, of } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const platformId = inject(PLATFORM_ID);
  if (isPlatformServer(platformId)) {
    return of(true);
  }

  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.checkSession().pipe(
    map((isAuthenticated) => {
      if (!isAuthenticated) {
        return router.createUrlTree(['/login']);
      }

      const user = authService.currentUser();
      if (user && user.onboardingCompleted === false) {
        return router.createUrlTree(['/onboarding']);
      }

      return true;
    })
  );
};

export const onboardingGuard: CanActivateFn = () => {
  const platformId = inject(PLATFORM_ID);
  if (isPlatformServer(platformId)) {
    return of(true);
  }

  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.checkSession().pipe(
    map((isAuthenticated) => {
      if (!isAuthenticated) {
        return router.createUrlTree(['/login']);
      }

      const user = authService.currentUser();
      if (user && user.onboardingCompleted === true) {
        return router.createUrlTree(['/dashboard']);
      }

      return true;
    })
  );
};

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
        const user = authService.currentUser();
        if (user && user.onboardingCompleted === false) {
          return router.createUrlTree(['/onboarding']);
        }
        return router.createUrlTree(['/dashboard']);
      }
      return true;
    })
  );
};
