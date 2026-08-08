import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { Auth } from '../auth/services/auth';

export const authGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (auth.currentUser()) {
    return true;
  }

  return auth.me().pipe(
    map(() => true),
    catchError(() => of(router.createUrlTree(['/login']))),
  );
};
