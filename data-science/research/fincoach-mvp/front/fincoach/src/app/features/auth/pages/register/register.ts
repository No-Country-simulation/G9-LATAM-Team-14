import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { RegisterCredentials } from '../../../../core/auth/models/auth.model';
import { Auth } from '../../../../core/auth/services/auth';
import { Logo } from '../../../../shared/components/logo/logo';

const passwordsMatch: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const passwordConfirmation = control.get('passwordConfirmation')?.value;

  return password === passwordConfirmation ? null : { passwordsMismatch: true };
};

@Component({
  selector: 'app-register',
  imports: [Logo, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
})
export class Register {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  readonly registerForm = new FormGroup(
    {
      firstName: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(150)],
      }),
      lastName: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(150)],
      }),
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
      password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(8)],
      }),
      passwordConfirmation: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      acceptsDataProcessing: new FormControl(false, {
        nonNullable: true,
        validators: [Validators.requiredTrue],
      }),
    },
    { validators: passwordsMatch },
  );

  readonly isLoading = signal(false);
  readonly showPassword = signal(false);
  readonly errorMessage = signal('');
  readonly serverFieldErrors = signal<Record<string, string>>({});

  submit(): void {
    this.registerForm.markAllAsTouched();

    if (this.registerForm.invalid || this.isLoading()) {
      return;
    }

    const formValue = this.registerForm.getRawValue();
    const credentials: RegisterCredentials = {
      first_name: formValue.firstName.trim(),
      last_name: formValue.lastName.trim(),
      email: formValue.email.trim(),
      password: formValue.password,
      accepts_data_processing: formValue.acceptsDataProcessing,
    };

    this.errorMessage.set('');
    this.serverFieldErrors.set({});
    this.isLoading.set(true);

    this.auth
      .register(credentials)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.router.navigate(['/login']);
        },
        error: (error: HttpErrorResponse) => this.handleError(error),
      });
  }

  togglePassword(): void {
    this.showPassword.update((visible) => !visible);
  }

  fieldServerError(field: string): string {
    return this.serverFieldErrors()[field] ?? '';
  }

  private handleError(error: HttpErrorResponse): void {
    if (error.status === 0) {
      this.errorMessage.set(
        'No fue posible conectar con el servidor. Verifica que Django esté ejecutándose.',
      );
      return;
    }

    const response = error.error;
    if (error.status === 400 && response && typeof response === 'object') {
      const fieldMap: Record<string, string> = {
        first_name: 'firstName',
        last_name: 'lastName',
        email: 'email',
        password: 'password',
        accepts_data_processing: 'acceptsDataProcessing',
      };
      const fieldErrors: Record<string, string> = {};

      for (const [backendField, formField] of Object.entries(fieldMap)) {
        const messages = response[backendField];
        if (messages) {
          fieldErrors[formField] = this.translateError(
            Array.isArray(messages) ? messages.join(' ') : String(messages),
          );
        }
      }

      this.serverFieldErrors.set(fieldErrors);

      if (response.non_field_errors) {
        const messages = Array.isArray(response.non_field_errors)
          ? response.non_field_errors.join(' ')
          : String(response.non_field_errors);
        this.errorMessage.set(this.translateError(messages));
      } else if (Object.keys(fieldErrors).length === 0) {
        this.errorMessage.set('Revisa la información e inténtalo nuevamente.');
      }
      return;
    }

    this.errorMessage.set('No fue posible crear la cuenta. Inténtalo nuevamente.');
  }

  private translateError(message: string): string {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('already exists')) {
      return 'Ya existe una cuenta registrada con este correo.';
    }
    if (lowerMessage.includes('too short')) {
      return 'La contraseña debe tener al menos 8 caracteres.';
    }
    if (lowerMessage.includes('too common')) {
      return 'La contraseña es demasiado común. Elige una más segura.';
    }
    if (lowerMessage.includes('entirely numeric')) {
      return 'La contraseña no puede contener únicamente números.';
    }
    if (lowerMessage.includes('too similar')) {
      return 'La contraseña se parece demasiado a tus datos personales.';
    }
    if (lowerMessage.includes('data processing')) {
      return 'Debes aceptar el tratamiento de datos personales.';
    }

    return message;
  }
}
