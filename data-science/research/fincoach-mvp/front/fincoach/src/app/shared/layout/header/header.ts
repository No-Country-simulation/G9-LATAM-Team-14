import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { Auth } from '../../../core/auth/services/auth';
import { Logo } from '../../components/logo/logo';

@Component({
  selector: 'app-header',
  imports: [Logo, RouterLink],
  templateUrl: './header.html',
})
export class Header {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  readonly user = this.auth.currentUser;
  readonly isLoggingOut = signal(false);
  readonly logoutError = signal('');
  readonly fullName = computed(() => {
    const user = this.user();
    return user ? `${user.first_name} ${user.last_name}`.trim() : '';
  });
  readonly initials = computed(() => {
    const user = this.user();
    if (!user) {
      return 'FC';
    }

    return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
  });

  logout(): void {
    if (this.isLoggingOut()) {
      return;
    }

    this.logoutError.set('');
    this.isLoggingOut.set(true);
    this.auth
      .logout()
      .pipe(finalize(() => this.isLoggingOut.set(false)))
      .subscribe({
        next: () => this.router.navigate(['/login']),
        error: (error: HttpErrorResponse) => {
          if (error.status === 401) {
            this.auth.clearCurrentUser();
            this.router.navigate(['/login']);
            return;
          }

          this.logoutError.set(
            'No fue posible cerrar la sesión. Inténtalo nuevamente.',
          );
        },
      });
  }
}
