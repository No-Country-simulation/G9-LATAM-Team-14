import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './auth.html',
})
export class Auth {
  private authService = inject(AuthService);

  email = '';
  password = '';
  showPassword = false;

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

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