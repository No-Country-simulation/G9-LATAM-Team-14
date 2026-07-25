import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/auth/services/auth.service';
import { AuthHeaderComponent } from '../../shared/components/auth-header/auth-header';
import { AuthInputComponent } from '../../shared/components/auth-input/auth-input';
import { GoogleButtonComponent } from '../../shared/components/google-button/google-button';
import { IconFinCoachComponent } from '../../shared/icons/iconsFinCoach';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    AuthHeaderComponent,
    AuthInputComponent,
    GoogleButtonComponent,
    IconFinCoachComponent
  ],
  templateUrl: './auth.html',
})
export class Auth {
  private authService = inject(AuthService);

  email = '';
  password = '';

  onLogin() {
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        window.location.replace('/dashboard');
      },
      error: (err) => {
        console.error('Error al iniciar sesión:', err);
        alert('Credenciales incorrectas');
      }
    });
  }
}