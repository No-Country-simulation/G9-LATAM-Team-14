import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/auth/services/auth.service';
import { AuthHeaderComponent } from '../../shared/components/auth-header/auth-header';
import { AuthInputComponent } from '../../shared/components/auth-input/auth-input';
import { GoogleButtonComponent } from '../../shared/components/google-button/google-button';
import { IconFinCoachComponent } from '../../shared/icons/iconsFinCoach';
import { LegalDocumentType, LegalModalComponent } from './components/legal-modal/legal-modal';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    AuthHeaderComponent,
    AuthInputComponent,
    GoogleButtonComponent,
    IconFinCoachComponent,
    LegalModalComponent
  ],
  templateUrl: './register.html',
})
export class Register {
  private authService = inject(AuthService);
  private router = inject(Router);

  firstName = '';
  lastName = '';
  email = '';
  password = '';
  confirmPassword = '';
  acceptTerms = false;
  legalDocument: LegalDocumentType | null = null;

  isLoading = false;
  errorMessage = '';

  openLegalDocument(documentType: LegalDocumentType): void {
    this.legalDocument = documentType;
  }

  closeLegalDocument(): void {
    this.legalDocument = null;
  }

  onRegister() {
    this.errorMessage = '';

    if (!this.firstName.trim() || !this.lastName.trim() || !this.email.trim() || !this.password) {
      this.errorMessage = 'Por favor completa todos los campos requeridos.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    if (!this.acceptTerms) {
      this.errorMessage = 'Debes aceptar los Términos de servicio y la Política de privacidad.';
      return;
    }

    this.isLoading = true;
    const username = `${this.firstName.trim()} ${this.lastName.trim()}`;

    this.authService.register({ username, email: this.email, password: this.password }).subscribe({
      next: () => {
        this.isLoading = false;
        window.location.replace('/onboarding');
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error al registrar usuario:', err);
        this.errorMessage = err.error?.message || err.error || 'No se pudo completar el registro. Intenta de nuevo.';
      }
    });
  }
}
