import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/auth/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private authService = inject(AuthService);
  currentUser = this.authService.currentUser;

  onLogout() {
  console.log('CLICK LOGOUT');

  this.authService.logout().subscribe({
    next: () => {
      console.log('LOGOUT OK');
      window.location.replace('/login');
    },
    error: (err) => {
      console.error('ERROR LOGOUT', err);
    }
  });
}
}