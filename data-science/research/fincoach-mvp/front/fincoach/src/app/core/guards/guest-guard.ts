import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { Auth } from '../auth/services/auth';

export const guestGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (auth.currentUser()) {
    return router.createUrlTree(['/me']);
  }

  return auth.me().pipe(
    map(() => router.createUrlTree(['/me'])),
    catchError(() => of(true)),
  );
};
