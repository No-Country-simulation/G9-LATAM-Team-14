import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { Auth } from '../../../../core/auth/services/auth';
import { Logo } from '../../../../shared/components/logo/logo';

@Component({
  selector: 'app-login',
  imports: [Logo, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
})
export class Login {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  readonly loginForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  readonly isLoading = signal(false);
  readonly showPassword = signal(false);
  readonly errorMessage = signal('');

  submit(): void {
    this.loginForm.markAllAsTouched();

    if (this.loginForm.invalid || this.isLoading()) {
      return;
    }

    this.errorMessage.set('');
    this.isLoading.set(true);

    this.auth
      .login(this.loginForm.getRawValue())
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.router.navigate(['/profile']);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(this.getErrorMessage(error));
        },
      });
  }

  togglePassword(): void {
    this.showPassword.update((visible) => !visible);
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'No fue posible conectar con el servidor. Verifica que Django esté ejecutándose.';
    }

    if (error.status === 400 && error.error?.non_field_errors?.length) {
      return 'Credenciales incorrectas';
    }

    if (typeof error.error?.detail === 'string') {
      return error.error.detail;
    }

    return 'No fue posible iniciar sesión. Inténtalo nuevamente.';
  }
}
